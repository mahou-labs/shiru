import { beforeAll, describe, expect, it, vi } from "vite-plus/test";

import type { createClient as CreateClient } from "../test/client";

// Better Auth's limiter only runs in production, so load the app with that environment.
let createClient: typeof CreateClient;

beforeAll(async () => {
  vi.resetModules();
  const { env } = await import("../test/bindings");
  env.ENVIRONMENT = "production";
  ({ createClient } = await import("../test/client"));
});

describe("auth rate limiting in production", () => {
  it("allows 3 sign-in attempts per 10 seconds from one IP", async () => {
    const client = createClient();
    const signIn = (ip: string) =>
      client.request("/auth/sign-in/email", {
        method: "POST",
        headers: { "cf-connecting-ip": ip },
        body: JSON.stringify({ email: "ada@example.com", password: "wrong-password" }),
      });

    for (let i = 0; i < 3; i++) expect((await signIn("198.51.100.1")).status).toBe(401);
    const blocked = await signIn("198.51.100.1");
    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toEqual({ message: "Too many requests. Please try again later." });

    expect((await signIn("198.51.100.2")).status).toBe(401);
  });

  it("does not count session lookups", async () => {
    const client = createClient();
    for (let i = 0; i < 150; i++) {
      const session = await client.request("/auth/get-session", {
        headers: { "cf-connecting-ip": "198.51.100.3" },
      });
      expect(session.status).toBe(200);
    }
  });
});
