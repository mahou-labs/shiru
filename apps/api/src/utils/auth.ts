import { checkout, polar, portal, usage, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { env, waitUntil } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";

import * as schema from "../schema/auth";
import { claimTrial, syncSubscription } from "./billing";
import { db } from "./db";
import { sendInvitationEmail, sendPasswordResetEmail, sendVerificationEmail } from "./email";

const production = env.ENVIRONMENT === "production";

async function getActiveOrganization(userId: string) {
  const [membership] = await db
    .select({ organizationId: schema.members.organizationId })
    .from(schema.members)
    .where(eq(schema.members.userId, userId))
    .limit(1);
  return membership?.organizationId ?? null;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
    usePlural: true,
  }),
  trustedOrigins: [env.DASHBOARD_URL],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      waitUntil(sendPasswordResetEmail({ to: user.email, name: user.name, link: url }));
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      waitUntil(sendVerificationEmail({ to: user.email, name: user.name, link: url }));
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
      domain: production ? ".shiru.sh" : undefined,
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => ({
          data: { ...session, activeOrganizationId: await getActiveOrganization(session.userId) },
        }),
      },
    },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      sendInvitationEmail: async ({ id, email, inviter, organization }) => {
        waitUntil(
          sendInvitationEmail({
            to: email,
            inviter: inviter.user.name,
            organization: organization.name,
            link: `${env.DASHBOARD_URL}/invite/${id}`,
          }),
        );
      },
      schema: {
        organization: {
          additionalFields: {
            trialEndsAt: { type: "date", required: true, input: false },
          },
        },
      },
      organizationHooks: {
        beforeCreateOrganization: async ({ organization, user }) => ({
          data: { ...organization, trialEndsAt: await claimTrial(user.id, new Date()) },
        }),
      },
    }),
    polar({
      client: new Polar({
        accessToken: env.POLAR_ACCESS_TOKEN,
        server: production ? "production" : "sandbox",
      }),
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            { productId: env.POLAR_MONTHLY_PRODUCT_ID, slug: "monthly" },
            { productId: env.POLAR_YEARLY_PRODUCT_ID, slug: "yearly" },
          ],
          successUrl: `${env.DASHBOARD_URL}/success?checkout_id={CHECKOUT_ID}`,
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
        webhooks({
          secret: env.POLAR_WEBHOOK_SECRET,
          onSubscriptionCreated: ({ data }) => syncSubscription(data),
          onSubscriptionUpdated: ({ data }) => syncSubscription(data),
        }),
      ],
    }),
  ],
});
