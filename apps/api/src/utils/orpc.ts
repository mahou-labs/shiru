import { os } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { organizations } from "@/schema/auth";
import { subscriptions } from "@/schema/subscription";
import { auth } from "./auth";
import type { RpcContext } from "./context";
import { db } from "./db";
import { log } from "./logger";
import { tryCatch } from "./try-catch";

const TRIAL_PERIOD = 30 * 24 * 60 * 60 * 1000;

/**
 * Attempts to resolve an active organization for the user when none is set.
 * Lists the user's orgs, picks the first one, and sets it as active (forwarding
 * session cookies via resHeaders). Returns the resolved org ID, or null if the
 * user has no organizations.
 */
export async function resolveActiveOrganization(
  headers: Headers,
  resHeaders: Headers | undefined,
): Promise<string | null> {
  const orgs = await auth.api.listOrganizations({ headers });
  const nextOrg = orgs?.[0];

  const { headers: sessionHeaders } = await auth.api.setActiveOrganization({
    headers,
    returnHeaders: true,
    body: { organizationId: nextOrg?.id ?? null },
  });

  const cookies = sessionHeaders.getSetCookie();
  for (const cookie of cookies) {
    resHeaders?.append("set-cookie", cookie);
  }

  return nextOrg?.id ?? null;
}

export const o = os.$context<RpcContext>();

export const requireAuth = o
  .errors({
    UNAUTHORIZED: {
      status: 401,
      message: "Unauthorized",
    },
  })
  .middleware(({ context, errors, next }) => {
    if (!context?.user || !context.session) {
      throw errors.UNAUTHORIZED();
    }

    return next({ context: { user: context.user, session: context.session } });
  });

const subscriptionReason = z.enum(["no_organization", "no_active_subscription", "trial_expired"]);

const requireSubscription = o
  .errors({
    NOT_FOUND: {
      status: 404,
      message: "Organization not found",
      data: z.object({ reason: subscriptionReason }),
    },
    NO_SUBSCRIPTION: {
      status: 403,
      message: "No active subscription",
      data: z.object({ reason: subscriptionReason }),
    },
  })
  .middleware(async ({ context, errors, next }) => {
    let orgId = context?.session?.activeOrganizationId;

    if (!orgId) {
      orgId = await resolveActiveOrganization(context.headers, context.resHeaders);
      if (!orgId) {
        throw errors.NOT_FOUND({ data: { reason: "no_organization" } });
      }
    }

    const { data: subscription, error: dbSubError } = await tryCatch(
      db
        .select({ currentPeriodEnd: subscriptions.currentPeriodEnd })
        .from(subscriptions)
        .where(and(eq(subscriptions.organizationId, orgId), eq(subscriptions.status, "active")))
        .limit(1)
        .then((rows) => rows[0]),
    );

    if (dbSubError) {
      log.error("db.subscription_lookup_failed", dbSubError, { organizationId: orgId });
    }

    if (subscription) {
      const isNotExpired = subscription.currentPeriodEnd.getTime() > Date.now();
      if (isNotExpired) {
        return next();
      }
    }

    const { data: org, error: dbError } = await tryCatch(
      db
        .select({ createdAt: organizations.createdAt })
        .from(organizations)
        .where(eq(organizations.id, orgId))
        .then((rows) => rows[0]),
    );

    if (dbError || !org) {
      throw errors.NOT_FOUND({ data: { reason: "no_organization" } });
    }

    const timeSinceCreation = Date.now() - org.createdAt.getTime();

    if (timeSinceCreation < TRIAL_PERIOD) {
      return next();
    }

    const reason = subscription ? "no_active_subscription" : "trial_expired";
    throw errors.NO_SUBSCRIPTION({ data: { reason } });
  });

export const publicProcedure = o;
export const authedProcedure = publicProcedure.use(requireAuth);
export const protectedProcedure = authedProcedure.use(requireSubscription);
