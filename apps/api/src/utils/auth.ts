import { checkout, polar, portal, usage, webhooks } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import * as authSchema from "../schema/auth";
import { db } from "./db";
import { polarClient } from "./polar";

import { env } from "cloudflare:workers";
import { sendVerificationEmail } from "./email";
import { log } from "./logger";

async function getActiveOrganization(userId: string) {
  try {
    const userOrganizations = await db
      .select({ id: authSchema.organizations.id })
      .from(authSchema.members)
      .innerJoin(
        authSchema.organizations,
        eq(authSchema.members.organizationId, authSchema.organizations.id),
      )
      .where(eq(authSchema.members.userId, userId));
    return userOrganizations[0]?.id ?? null;
  } catch (error) {
    throw new Error(
      `Failed to fetch active organization: ${error instanceof Error ? error.message : "Unknown error"}`,
      { cause: error },
    );
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: authSchema,
    usePlural: true,
  }),
  trustedOrigins: [env.DASHBOARD_URL],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      // void email.sendPasswordResetEmail({
      //   email: user.email,
      //   name: user.name,
      //   resetLink: url,
      // });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendVerificationEmail({
        to: user.email,
        name: user.name,
        verificationLink: url,
      });
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/auth",
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      afterDelete: async (user) => {
        await polarClient.customers.deleteExternal({
          externalId: user.id,
        });
      },
    },
  },
  advanced: {
    database: {
      generateId: () => uuidv7(),
    },
    crossSubDomainCookies: {
      enabled: true,
    },
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true,
      partitioned: true,
      domain: env.ENVIRONMENT === "production" ? ".shiru.sh" : undefined,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          try {
            const { result: existingCustomers } = await polarClient.customers.list({
              email: user.email,
            });

            const existingCustomer = existingCustomers.items[0];

            if (existingCustomer?.externalId) {
              return {
                data: {
                  ...user,
                  id: existingCustomer.externalId,
                },
              };
            }
          } catch (error) {
            log.error("polar.customer_lookup_failed", error, { email: user.email });
          }

          return {
            data: user,
          };
        },
        after: async (user) => {
          try {
            const { result: existingCustomers } = await polarClient.customers.list({
              email: user.email,
            });

            if (existingCustomers.items[0]) {
              return;
            }

            await polarClient.customers.create({
              email: user.email,
              name: user.name,
              externalId: user.id,
            });
          } catch (error) {
            log.error("polar.customer_create_failed", error, {
              userId: user.id,
              email: user.email,
            });
          }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const orgId = await getActiveOrganization(session.userId);
          return {
            data: {
              ...session,
              activeOrganizationId: orgId,
            },
          };
        },
      },
    },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      allowUserToJoinOrganization: true,
      async sendInvitationEmail(data) {
        // await email.sendOrgInvite({
        //   email: data.email,
        //   invitedByUsername: data.inviter.user.name,
        //   invitedByEmail: data.inviter.user.email,
        //   teamName: data.organization.name,
        //   inviteLink: `${env.DASHBOARD_URL}/invite?id=${data.id}`,
        // });
      },
    }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: false,
      use: [
        checkout({
          products: [
            {
              productId: "542964f0-f9e4-4863-aa5a-9c787317ae54",
              slug: "starter-monthly",
            },
            {
              productId: "68c79948-d014-4c70-9e83-baa37b76e7cb",
              slug: "starter-yearly",
            },
            {
              productId: "899737cc-96c5-4d17-bc43-e3455434cc01",
              slug: "growth-monthly",
            },
            {
              productId: "f7e2348d-101d-4762-9a46-e5dd6b1adf27",
              slug: "growth-yearly",
            },
          ],
          successUrl: `${env.DASHBOARD_URL}/success?checkout_id={CHECKOUT_ID}`,
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
        webhooks({
          secret: env.POLAR_WEBHOOK_SECRET,
          onCustomerStateChanged: async (payload) =>
            log.info("polar.webhook.customer_state_changed", { payload }),
          onOrderPaid: async (payload) => log.info("polar.webhook.order_paid", { payload }),
          onOrganizationUpdated: async (payload) =>
            log.info("polar.webhook.organization_updated", { payload }),
          onPayload: async (payload) => log.info("polar.webhook.payload", { payload }),
        }),
      ],
    }),
  ],
});

// export type Auth = ReturnType<typeof createAuth>;

// const db = getDb();
// export const createAuth = (c: Context<Env>) => {
//   return betterAuth({
//     database: c.env.DB,
//   });
// };
