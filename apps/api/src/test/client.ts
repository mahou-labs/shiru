import app from "../index";
import { flushWaitUntil, sentEmails } from "./bindings";

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

export function verificationLink(email: string) {
  const message = sentEmails.findLast((sent) => sent.to === email);
  const link = message?.text.match(/http:\/\/localhost:3000\/auth\/verify-email\S+/)?.[0];
  if (!link) throw new Error(`no verification email for ${email}`);
  return link.replace(/[)\]]+$/, "");
}
