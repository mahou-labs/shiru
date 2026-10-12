import { describe, expect, it } from "vite-plus/test";

import app from "../index";

const SITE = "http://localhost:3002";

function joinWaitlist(ip: string, email: string) {
  return app.request("http://localhost:3000/rpc/waitlist/join", {
    method: "POST",
    headers: { Origin: SITE, "content-type": "application/json", "cf-connecting-ip": ip },
    body: JSON.stringify({ json: { email } }),
  });
}

function healthCheck(ip?: string) {
  const headers = new Headers({ Origin: SITE, "content-type": "application/json" });
  if (ip) headers.set("cf-connecting-ip", ip);
  return app.request("http://localhost:3000/rpc/healthCheck", {
    method: "POST",
    headers,
    body: "{}",
  });
}

describe("rate limiting", () => {
  it("allows 10 waitlist joins per minute from one IP", async () => {
    for (let i = 0; i < 10; i++) {
      expect((await joinWaitlist("203.0.113.1", `spam${i}@example.com`)).status).toBe(200);
    }
    const blocked = await joinWaitlist("203.0.113.1", "spam10@example.com");
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBe("60");
    expect(blocked.headers.get("access-control-allow-origin")).toBe(SITE);
    expect(await blocked.json()).toEqual({
      code: "RATE_LIMITED",
      message: "Too many requests. Try again in a minute.",
    });

    expect((await joinWaitlist("203.0.113.2", "other@example.com")).status).toBe(200);
  });

  it("allows 300 requests per minute from one IP across the API", async () => {
    for (let i = 0; i < 300; i++) {
      expect((await healthCheck("203.0.113.3")).status).toBe(200);
    }
    expect((await healthCheck("203.0.113.3")).status).toBe(429);
    expect((await healthCheck("203.0.113.4")).status).toBe(200);
  });

  it("skips requests without a client IP", async () => {
    expect((await healthCheck()).status).toBe(200);
  });
});
