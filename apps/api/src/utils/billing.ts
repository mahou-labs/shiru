import type { models } from "@polar-sh/sdk/2026-10";
import { and, eq, isNull, lt, sql } from "drizzle-orm";

import { organizations, users } from "../schema/auth";
import { subscriptions } from "../schema/billing";
import { db } from "./db";

const TRIAL_DAYS = 30;
const PAYING_STATUSES = ["active", "trialing"] as const;

type PayingStatus = (typeof PAYING_STATUSES)[number];

export type Access =
  | { kind: "subscription"; status: PayingStatus; currentPeriodEnd: Date }
  | { kind: "trial"; endsAt: Date };

export const ACCESS_DENIED_REASONS = ["no_active_subscription", "trial_expired"] as const;

export type AccessResult =
  | Access
  | { kind: "denied"; reason: (typeof ACCESS_DENIED_REASONS)[number] };

type SubscriptionState = { status: string; currentPeriodEnd: Date };

function isPayingStatus(status: string): status is PayingStatus {
  return (PAYING_STATUSES as readonly string[]).includes(status);
}

export async function claimTrial(userId: string, now: Date): Promise<Date> {
  const claimed = await db
    .update(users)
    .set({ trialUsedAt: now })
    .where(and(eq(users.id, userId), isNull(users.trialUsedAt)))
    .returning({ id: users.id });
  return claimed.length > 0 ? new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000) : now;
}

export function resolveAccess(
  trialEndsAt: Date,
  subscriptionStates: SubscriptionState[],
  now: Date,
): AccessResult {
  for (const { status, currentPeriodEnd } of subscriptionStates) {
    if (isPayingStatus(status) && currentPeriodEnd > now) {
      return { kind: "subscription", status, currentPeriodEnd };
    }
  }
  if (trialEndsAt > now) return { kind: "trial", endsAt: trialEndsAt };
  return {
    kind: "denied",
    reason: subscriptionStates.length > 0 ? "no_active_subscription" : "trial_expired",
  };
}

export async function getOrganizationAccess(organizationId: string): Promise<AccessResult> {
  const [[organization], subscriptionStates] = await Promise.all([
    db
      .select({ trialEndsAt: organizations.trialEndsAt })
      .from(organizations)
      .where(eq(organizations.id, organizationId)),
    db
      .select({ status: subscriptions.status, currentPeriodEnd: subscriptions.currentPeriodEnd })
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, organizationId)),
  ]);
  if (!organization) return { kind: "denied", reason: "no_active_subscription" };
  return resolveAccess(organization.trialEndsAt, subscriptionStates, new Date());
}

export async function syncSubscription(
  subscription: Pick<
    models.Subscription,
    "id" | "status" | "metadata" | "current_period_end" | "modified_at" | "created_at"
  >,
) {
  const organizationId = subscription.metadata.referenceId;
  if (typeof organizationId !== "string") {
    console.warn("polar.subscription_without_reference", { id: subscription.id });
    return;
  }
  const row = {
    id: subscription.id,
    organizationId,
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end),
    polarModifiedAt: new Date(subscription.modified_at ?? subscription.created_at),
  };
  await db
    .insert(subscriptions)
    .values(row)
    .onConflictDoUpdate({
      target: subscriptions.id,
      set: {
        status: row.status,
        currentPeriodEnd: row.currentPeriodEnd,
        polarModifiedAt: row.polarModifiedAt,
      },
      setWhere: lt(subscriptions.polarModifiedAt, sql`excluded.polar_modified_at`),
    });
}
