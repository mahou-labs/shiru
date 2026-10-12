import { call, ORPCError } from "@orpc/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { createClient, polarSubscription, postPolarWebhook } from "../test/client";
import { auth } from "./auth";
import { paidProcedure } from "./orpc";

const JAN_1 = new Date("2026-01-01T00:00:00.000Z");
const DAY = 24 * 60 * 60 * 1000;

const paidRoute = paidProcedure.handler(({ context }) => context.access);

async function callPaidRoute(client: ReturnType<typeof createClient>) {
  const headers = client.headers();
  return call(paidRoute, undefined, {
    context: { headers, auth: await auth.api.getSession({ headers }) },
  });
}

async function paymentError(promise: Promise<unknown>) {
  const error = await promise.catch((caught: unknown) => caught);
  expect(error).toBeInstanceOf(ORPCError);
  const { code, status, data } = error as ORPCError<string, unknown>;
  return { code, status, data };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(JAN_1);
});
afterEach(() => vi.useRealTimers());

describe("organizationProcedure", () => {
  it("asks users without an organization to create one", async () => {
    const client = createClient();
    await client.signUpVerified("no-org@example.com");
    expect(await client.rpc("subscription")).toEqual({
      status: 403,
      body: {
        json: {
          defined: true,
          code: "NO_ORGANIZATION",
          status: 403,
          message: "Create or join an organization first",
        },
      },
    });
  });

  it("falls back to another organization when the active one is deleted", async () => {
    const client = createClient();
    await client.signUpVerified("fallback@example.com");
    const first = await client.createOrganization("Fallback First");
    const second = await client.createOrganization("Fallback Second");
    await client.post("/auth/organization/set-active", { organizationId: first.id });
    await client.post("/auth/organization/delete", { organizationId: first.id });

    expect((await client.rpc("subscription")).body).toEqual({
      json: { kind: "denied", reason: "trial_expired" },
    });
    const session = await (await client.request("/auth/get-session")).json();
    expect(session).toMatchObject({ session: { activeOrganizationId: second.id } });
  });
});

describe("trials", () => {
  it("gives a user's first organization a 30-day trial", async () => {
    const client = createClient();
    await client.signUpVerified("first-trial@example.com");
    await client.createOrganization("First Trial");
    expect(await client.rpc("subscription")).toEqual({
      status: 200,
      body: { json: { kind: "trial", endsAt: "2026-01-31T00:00:00.000Z" }, meta: [[1, "endsAt"]] },
    });
  });

  it("gives later organizations no trial, even after deleting the first", async () => {
    const client = createClient();
    await client.signUpVerified("second-trial@example.com");
    const first = await client.createOrganization("Second Trial A");
    await client.post("/auth/organization/delete", { organizationId: first.id });
    await client.createOrganization("Second Trial B");
    expect((await client.rpc("subscription")).body).toEqual({
      json: { kind: "denied", reason: "trial_expired" },
    });
  });

  it("ignores a trial end sent by the client", async () => {
    const client = createClient();
    await client.signUpVerified("forged-trial@example.com");
    await client.createOrganization("Forged Trial A");
    const response = await client.post("/auth/organization/create", {
      name: "Forged Trial B",
      slug: "forged-trial-b",
      trialEndsAt: "2099-01-01T00:00:00.000Z",
    });
    expect(await response.json()).toMatchObject({ trialEndsAt: "2026-01-01T00:00:00.000Z" });
  });
});

describe("paidProcedure", () => {
  it("grants access during the trial and refuses it afterwards", async () => {
    const client = createClient();
    await client.signUpVerified("paid-trial@example.com");
    await client.createOrganization("Paid Trial");
    expect(await callPaidRoute(client)).toEqual({
      kind: "trial",
      endsAt: new Date("2026-01-31T00:00:00.000Z"),
    });

    vi.setSystemTime(JAN_1.getTime() + 31 * DAY);
    await client.post("/auth/sign-in/email", {
      email: "paid-trial@example.com",
      password: "password123",
    });
    expect(await paymentError(callPaidRoute(client))).toEqual({
      code: "PAYMENT_REQUIRED",
      status: 402,
      data: { reason: "trial_expired" },
    });
  });

  it("follows the latest Polar subscription state, ignoring stale events", async () => {
    const client = createClient();
    await client.signUpVerified("paid-sub@example.com");
    await client.createOrganization("Paid Sub A");
    const organization = await client.createOrganization("Paid Sub B");
    const event = (status: "active" | "canceled", modifiedAt: string) =>
      postPolarWebhook(
        "subscription.updated",
        polarSubscription({
          id: "sub_1",
          status,
          metadata: { referenceId: organization.id },
          current_period_end: "2026-02-01T00:00:00Z",
          created_at: "2026-01-01T00:00:00Z",
          modified_at: modifiedAt,
        }),
      );

    await event("active", "2026-01-01T10:00:00Z");
    expect(await callPaidRoute(client)).toEqual({
      kind: "subscription",
      status: "active",
      currentPeriodEnd: new Date("2026-02-01T00:00:00.000Z"),
    });

    await event("canceled", "2026-01-01T09:00:00Z");
    expect(await callPaidRoute(client)).toMatchObject({ kind: "subscription", status: "active" });

    await postPolarWebhook(
      "subscription.created",
      polarSubscription({
        id: "sub_unlinked",
        status: "active",
        metadata: {},
        current_period_end: "2026-06-01T00:00:00Z",
        created_at: "2026-01-01T00:00:00Z",
        modified_at: "2026-01-01T12:00:00Z",
      }),
    );
    await event("canceled", "2026-01-01T11:00:00Z");
    expect(await paymentError(callPaidRoute(client))).toEqual({
      code: "PAYMENT_REQUIRED",
      status: 402,
      data: { reason: "no_active_subscription" },
    });
  });
});
