import { os } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { organizations } from "@/schema/auth";
import { subscriptions } from "@/schema/subscription";
import type { RpcContext } from "./context";
import { db } from "./db";
import { log } from "./logger";
import { tryCatch } from "./try-catch";

const TRIAL_PERIOD = 30 * 24 * 60 * 60 * 1000;

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
    const orgId = context?.session?.activeOrganizationId;
    if (!orgId) {
      throw errors.NOT_FOUND({ data: { reason: "no_organization" } });
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

    // Fall back to trial period check
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

    // Had a subscription but it's expired, or trial ran out
    const reason = subscription ? "no_active_subscription" : "trial_expired";
    throw errors.NO_SUBSCRIPTION({ data: { reason } });
  });

export const publicProcedure = o;
export const authedProcedure = publicProcedure.use(requireAuth);
export const protectedProcedure = authedProcedure.use(requireSubscription);

