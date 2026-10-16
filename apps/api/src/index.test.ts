import { describe, expect, it } from "vite-plus/test";

import { app } from "./index";
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
