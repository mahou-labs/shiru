import { describe, expect, it } from "vite-plus/test";

import { resolveAccess } from "./billing";

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
