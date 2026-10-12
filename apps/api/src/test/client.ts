import app from "../index";
import { env, flushWaitUntil, sentEmails } from "./bindings";

const API = "http://localhost:3000";
const DASHBOARD = "http://localhost:3001";

export function createClient() {
  const cookies = new Map<string, string>();

  async function request(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    if (!headers.has("Origin")) headers.set("Origin", DASHBOARD);
    if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
    if (cookies.size > 0) {
      headers.set("cookie", [...cookies].map(([name, value]) => `${name}=${value}`).join("; "));
    }
    const response = await app.request(new URL(path, API), { ...init, headers });
    for (const cookie of response.headers.getSetCookie()) {
      const [pair = ""] = cookie.split(";");
      const [name = "", value = ""] = pair.split("=");
      if (value) cookies.set(name, value);
      else cookies.delete(name);
    }
    await flushWaitUntil();
    return response;
  }

  const post = (path: string, body: unknown = {}) =>
    request(path, { method: "POST", body: JSON.stringify(body) });

  return {
    request,
    post,
    headers() {
      const headers = new Headers({ Origin: DASHBOARD });
      headers.set("cookie", [...cookies].map(([name, value]) => `${name}=${value}`).join("; "));
      return headers;
    },
    async createOrganization(name: string) {
      const response = await post("/auth/organization/create", {
        name,
        slug: name.toLowerCase().replaceAll(" ", "-"),
      });
      const organization = (await response.json()) as { id: string; trialEndsAt: string };
      await post("/auth/organization/set-active", { organizationId: organization.id });
      return organization;
    },
    async rpc(procedure: string, input?: unknown) {
      const response = await post(`/rpc/${procedure}`, input === undefined ? {} : { json: input });
      return { status: response.status, body: (await response.json()) as { json: unknown } };
    },
    async signUpVerified(email: string, name = "Test User", password = "password123") {
      await post("/auth/sign-up/email", {
        email,
        password,
        name,
        callbackURL: `${DASHBOARD}/dashboard`,
      });
      await request(verificationLink(email));
    },
  };
}

// Signs the way Polar does (Standard Webhooks, keyed with the secret's UTF-8 bytes).
export async function postPolarWebhook(type: string, data: Record<string, unknown>) {
  const body = JSON.stringify({ type, timestamp: new Date().toISOString(), data });
  const id = `msg_${crypto.randomUUID()}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.POLAR_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${id}.${timestamp}.${body}`),
  );
  const response = await app.request(new URL("/auth/polar/webhooks", API), {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      "webhook-id": id,
      "webhook-timestamp": String(timestamp),
      "webhook-signature": `v1,${Buffer.from(signature).toString("base64")}`,
    },
  });
  await flushWaitUntil();
  return response;
}

// A subscription as Polar's 2026-10 API serializes it in webhooks.
export function polarSubscription(fields: {
  id: string;
  status: string;
  metadata: Record<string, unknown>;
  current_period_end: string;
  created_at: string;
  modified_at: string | null;
}) {
  return {
    amount: 1900,
    currency: "usd",
    recurring_interval: "month",
    recurring_interval_count: 1,
    current_period_start: fields.created_at,
    trial_start: null,
    trial_end: null,
    cancel_at_period_end: false,
    canceled_at: null,
    started_at: fields.created_at,
    ends_at: null,
    ended_at: null,
    customer_id: "cus_1",
    product_id: "prod_test_monthly",
    discount_id: null,
    checkout_id: "checkout_1",
    customer_cancellation_reason: null,
    customer_cancellation_comment: null,
    custom_field_data: {},
    ...fields,
  };
}

export function verificationLink(email: string) {
  const message = sentEmails.findLast((sent) => sent.to === email);
  const link = message?.text.match(/http:\/\/localhost:3000\/auth\/verify-email\S+/)?.[0];
  if (!link) throw new Error(`no verification email for ${email}`);
  return link.replace(/[)\]]+$/, "");
}
