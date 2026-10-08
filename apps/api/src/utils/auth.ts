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
import { sendVerificationEmail } from "./email";

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
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      waitUntil(sendVerificationEmail({ to: user.email, name: user.name, verificationLink: url }));
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
            { productId: "542964f0-f9e4-4863-aa5a-9c787317ae54", slug: "starter-monthly" },
            { productId: "68c79948-d014-4c70-9e83-baa37b76e7cb", slug: "starter-yearly" },
            { productId: "899737cc-96c5-4d17-bc43-e3455434cc01", slug: "growth-monthly" },
            { productId: "f7e2348d-101d-4762-9a46-e5dd6b1adf27", slug: "growth-yearly" },
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
