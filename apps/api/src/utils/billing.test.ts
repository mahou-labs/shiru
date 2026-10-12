import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { subscriptions } from "../schema/billing";
import { createClient, polarSubscription, postPolarWebhook } from "../test/client";
import { getOrganizationAccess, resolveAccess } from "./billing";
import { db } from "./db";

const NOW = new Date("2026-03-01T00:00:00.000Z");
const TRIAL_RUNNING = new Date("2026-03-10T00:00:00.000Z");
const TRIAL_OVER = new Date("2026-02-01T00:00:00.000Z");
const PERIOD_ENDS = new Date("2026-03-31T00:00:00.000Z");
const PERIOD_ENDED = new Date("2026-02-28T00:00:00.000Z");

describe("resolveAccess", () => {
  it("grants access for an active subscription in its period", () => {
    expect(
      resolveAccess(TRIAL_OVER, [{ status: "active", currentPeriodEnd: PERIOD_ENDS }], NOW),
    ).toEqual({
      kind: "subscription",
      status: "active",
      currentPeriodEnd: PERIOD_ENDS,
    });
  });

  it("treats a Polar trialing subscription as paying", () => {
    expect(
      resolveAccess(TRIAL_OVER, [{ status: "trialing", currentPeriodEnd: PERIOD_ENDS }], NOW),
    ).toEqual({
      kind: "subscription",
      status: "trialing",
      currentPeriodEnd: PERIOD_ENDS,
    });
  });

  it("prefers the paying subscription when an organization has several", () => {
    const access = resolveAccess(
      TRIAL_OVER,
      [
        { status: "canceled", currentPeriodEnd: PERIOD_ENDS },
        { status: "active", currentPeriodEnd: PERIOD_ENDS },
      ],
      NOW,
    );
    expect(access).toMatchObject({ kind: "subscription", status: "active" });
  });

  it("falls back to the trial when the subscription period has ended", () => {
    expect(
      resolveAccess(TRIAL_RUNNING, [{ status: "active", currentPeriodEnd: PERIOD_ENDED }], NOW),
    ).toEqual({
      kind: "trial",
      endsAt: TRIAL_RUNNING,
    });
  });

  it("explains a refusal for an organization that has subscribed before", () => {
    expect(
      resolveAccess(TRIAL_OVER, [{ status: "past_due", currentPeriodEnd: PERIOD_ENDS }], NOW),
    ).toEqual({
      kind: "denied",
      reason: "no_active_subscription",
    });
  });

  it("explains a refusal for an organization that never subscribed", () => {
    expect(resolveAccess(TRIAL_OVER, [], NOW)).toEqual({ kind: "denied", reason: "trial_expired" });
  });
});

describe("Polar subscription webhooks", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("links a new subscription to the organization in its metadata and grants access", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    const client = createClient();
    await client.signUpVerified("webhook@example.com");
    await client.createOrganization("Webhook Trial");
    const organization = await client.createOrganization("Webhook Paid");
    expect(await getOrganizationAccess(organization.id)).toEqual({
      kind: "denied",
      reason: "trial_expired",
    });

    const response = await postPolarWebhook(
      "subscription.created",
      polarSubscription({
        id: "sub_webhook",
        status: "active",
        metadata: { referenceId: organization.id },
        current_period_end: "2026-03-31T00:00:00Z",
        created_at: "2026-03-01T00:00:00Z",
        modified_at: null,
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true });
    expect(await db.select().from(subscriptions)).toEqual([
      {
        id: "sub_webhook",
        organizationId: organization.id,
        status: "active",
        currentPeriodEnd: PERIOD_ENDS,
        polarModifiedAt: NOW,
      },
    ]);
    expect(await getOrganizationAccess(organization.id)).toEqual({
      kind: "subscription",
      status: "active",
      currentPeriodEnd: PERIOD_ENDS,
    });
  });

  it("rejects a webhook that is not signed with the Polar secret", async () => {
    const response = await createClient().request("/auth/polar/webhooks", {
      method: "POST",
      body: JSON.stringify({ type: "subscription.created", data: {} }),
      headers: {
        "webhook-id": "msg_forged",
        "webhook-timestamp": String(Math.floor(Date.now() / 1000)),
        "webhook-signature": "v1,Zm9yZ2Vk",
      },
    });
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({
      message: "Webhook Error: No matching signature found",
    });
  });
});
