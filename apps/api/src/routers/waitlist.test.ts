import { eq } from "drizzle-orm";
import { describe, expect, it } from "vite-plus/test";

import app from "../index";
import { waitlistEntries } from "../schema/waitlist";
import { createClient } from "../test/client";
import { db } from "../utils/db";

const SITE = "http://localhost:3002";

const entriesFor = (email: string) =>
  db.select().from(waitlistEntries).where(eq(waitlistEntries.email, email));

describe("waitlist.join", () => {
  it("adds the trimmed, lowercased email", async () => {
    expect(await createClient().rpc("waitlist/join", { email: "  New@Example.com " })).toEqual({
      status: 200,
      body: { json: { joined: true } },
    });
    const entries = await entriesFor("new@example.com");
    expect(entries.map((entry) => entry.email)).toEqual(["new@example.com"]);
    expect(entries[0]?.createdAt).toBeInstanceOf(Date);
  });

  it("answers the same way for an email already on the list", async () => {
    const client = createClient();
    const first = await client.rpc("waitlist/join", { email: "twice@example.com" });
    const second = await client.rpc("waitlist/join", { email: "Twice@Example.COM" });
    expect(first).toEqual({ status: 200, body: { json: { joined: true } } });
    expect(second).toEqual(first);
    expect(await entriesFor("twice@example.com")).toHaveLength(1);
  });

  it("rejects an invalid email", async () => {
    const { status, body } = await createClient().rpc("waitlist/join", { email: "not-an-email" });
    expect(status).toBe(400);
    expect(body.json).toMatchObject({ defined: false, code: "BAD_REQUEST", status: 400 });
    expect(await entriesFor("not-an-email")).toEqual([]);
  });

  it("accepts the marketing site's uncredentialed request", async () => {
    const response = await createClient().request("/rpc/waitlist/join", {
      method: "POST",
      headers: { Origin: SITE, "content-type": "application/json" },
      body: JSON.stringify({ json: { email: "site@example.com" } }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe(SITE);
    expect(await response.json()).toEqual({ json: { joined: true } });
  });
});

describe("waitlist CORS", () => {
  const preflight = (origin: string) =>
    app.request("http://localhost:3000/rpc/waitlist/join", {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });

  it("allows the marketing site", async () => {
    const response = await preflight(SITE);
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(SITE);
  });

  it("does not allow other origins", async () => {
    const response = await preflight("https://evil.example");
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });
});
