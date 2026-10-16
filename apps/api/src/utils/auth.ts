import { mcp } from "@better-auth/mcp";
import { checkout, polar, portal, usage, webhooks } from "@polar-sh/better-auth";
import { createPolarCore } from "@polar-sh/sdk/2026-10";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { jwt, organization } from "better-auth/plugins";
import { env, waitUntil } from "cloudflare:workers";
import { and, eq, gt } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";

import * as schema from "../schema/auth";
import { claimTrial, syncSubscription } from "./billing";
import { db } from "./db";
import { sendInvitationEmail, sendPasswordResetEmail, sendVerificationEmail } from "./email";

const production = env.ENVIRONMENT === "production";

/** The MCP server's URL, which every MCP access token names as its audience. */
export const MCP_RESOURCE = `${env.BETTER_AUTH_URL}/mcp`;
export const MCP_ISSUER = `${env.BETTER_AUTH_URL}/auth`;
const MCP_SCOPES = ["docs:read", "docs:write"] as const;
export type McpScope = (typeof MCP_SCOPES)[number];

async function getActiveOrganization(userId: string) {
  const [membership] = await db
    .select({ organizationId: schema.members.organizationId })
    .from(schema.members)
    .where(eq(schema.members.userId, userId))
    .limit(1);
  return membership?.organizationId ?? null;
}

const VERIFICATION_EMAIL_COOLDOWN_MS = 60_000;

// Seconds left before another verification email may go to this address, or 0.
// Every sign-up and resend starts the cooldown, whether or not the address has an
// account, so the response never reveals which emails are registered.
async function claimVerificationEmailSlot(email: string, now: Date) {
  const identifier = `verification-email-cooldown:${email.toLowerCase()}`;
  const [active] = await db
    .select({ expiresAt: schema.verifications.expiresAt })
    .from(schema.verifications)
    .where(
      and(eq(schema.verifications.identifier, identifier), gt(schema.verifications.expiresAt, now)),
    )
    .limit(1);
  if (active) return Math.ceil((active.expiresAt.getTime() - now.getTime()) / 1000);

  await db.delete(schema.verifications).where(eq(schema.verifications.identifier, identifier));
  await db.insert(schema.verifications).values({
    id: uuidv7(),
    identifier,
    value: "",
    expiresAt: new Date(now.getTime() + VERIFICATION_EMAIL_COOLDOWN_MS),
  });
  return 0;
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
  rateLimit: {
    enabled: production,
    // Workers isolates don't share memory, so counters live in D1.
    storage: "database",
    customRules: {
      // Polled by the dashboard on every navigation; the Worker-level limiter covers it.
      "/get-session": false,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip"],
    },
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
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email" && ctx.path !== "/send-verification-email") return;
      const email = (ctx.body as { email?: unknown } | undefined)?.email;
      if (typeof email !== "string") return;
      const retryAfter = await claimVerificationEmailSlot(email, new Date());
      if (retryAfter > 0 && ctx.path === "/send-verification-email") {
        throw new APIError("TOO_MANY_REQUESTS", {
          code: "VERIFICATION_EMAIL_COOLDOWN",
          message: `Wait ${retryAfter}s before requesting another email.`,
          retryAfter,
        });
      }
    }),
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
    jwt({
      // The dashboard polls get-session, and has no use for a signed copy of the session.
      disableSettingJwtHeader: true,
      // usePlural would otherwise look for a `jwkss` table.
      schema: { jwks: { modelName: "jwk" } },
    }),
    mcp({
      resource: MCP_RESOURCE,
      loginPage: `${env.DASHBOARD_URL}/auth/sign-in`,
      consentPage: `${env.DASHBOARD_URL}/oauth/consent`,
      scopes: ["offline_access", ...MCP_SCOPES],
      grantTypes: ["authorization_code", "refresh_token"],
      // Coding agents register themselves the first time they connect, before anyone signs in.
      allowDynamicClientRegistration: true,
      allowUnauthenticatedClientRegistration: true,
      clientRegistrationDefaultScopes: ["offline_access", ...MCP_SCOPES],
    }),
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
      client: createPolarCore({
        accessToken: env.POLAR_ACCESS_TOKEN,
        environment: production ? "production" : "sandbox",
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
