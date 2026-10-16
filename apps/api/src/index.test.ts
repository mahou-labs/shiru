import { describe, expect, it, vi } from "vite-plus/test";

import worker, { app } from "./index";
import { env } from "./test/bindings";
import { createClient } from "./test/client";

describe("public API", () => {
  it("answers the health check", async () => {
    const client = createClient();
    expect(await (await client.request("/")).text()).toBe("OK");
    expect(await client.rpc("healthCheck")).toEqual({ status: 200, body: { json: "OK" } });
  });

  it("serves authed procedures to signed-in users", async () => {
    const client = createClient();
    await client.signUpVerified("private@example.com", "Private Person");
    const { status, body } = await client.rpc("privateData");
    expect(status).toBe(200);
    expect(body.json).toMatchObject({
      message: "This is private",
      user: { email: "private@example.com", name: "Private Person" },
    });
  });

  it("rejects signed-out callers of authed procedures", async () => {
    expect(await createClient().rpc("privateData")).toEqual({
      status: 401,
      body: {
        json: { defined: true, code: "UNAUTHORIZED", status: 401, message: "Sign in to continue" },
      },
    });
  });
});

describe("CORS", () => {
  const preflight = (origin: string) =>
    app.request("http://localhost:3000/rpc/privateData", {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });

  it("allows credentialed requests from the dashboard", async () => {
    const response = await preflight("http://localhost:3001");
    expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:3001");
    expect(response.headers.get("access-control-allow-credentials")).toBe("true");
  });

  it("does not allow other origins", async () => {
    const response = await preflight("https://evil.example");
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });
});

describe("scheduled", () => {
  it("syncs custom domains with Cloudflare in the background", async () => {
    const work: Promise<unknown>[] = [];
    const logged: unknown[][] = [];
    const errors = vi.spyOn(console, "error").mockImplementation((...args) => logged.push(args));
    env.ENVIRONMENT = "production";
    env.CUSTOM_HOSTNAMES_API_TOKEN = "";
    try {
      worker.scheduled(
        {} as ScheduledController,
        env as never,
        { waitUntil: (promise: Promise<unknown>) => work.push(promise) } as never,
      );
      await Promise.all(work);
    } finally {
      env.ENVIRONMENT = "development";
      env.CUSTOM_HOSTNAMES_API_TOKEN = "test-hostnames-token";
      errors.mockRestore();
    }

    expect(work).toHaveLength(1);
    expect(logged).toEqual([
      [
        "custom domains not refreshed: Custom domains are not configured: CUSTOM_HOSTNAMES_API_TOKEN is not set",
      ],
    ]);
  });
});
