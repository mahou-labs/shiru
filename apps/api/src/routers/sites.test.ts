import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { createClient } from "../test/client";

const JAN_1 = new Date("2026-01-01T00:00:00.000Z");
const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;
const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(JAN_1);
});
afterEach(() => vi.useRealTimers());

async function organizationMember(email: string, organization: string) {
  const client = createClient();
  await client.signUpVerified(email);
  const { id } = await client.createOrganization(organization);
  return { client, organizationId: id };
}

async function createSite(client: ReturnType<typeof createClient>, slug: string, name: string) {
  const { status, body } = await client.rpc("sites/create", { slug, name });
  expect(status).toBe(200);
  return body.json as { id: string };
}

describe("sites.create", () => {
  it("creates a managed site whose repo is named after the site id", async () => {
    const { client, organizationId } = await organizationMember("create@example.com", "Create");
    const { status, body } = await client.rpc("sites/create", { slug: "acme", name: " Acme " });
    const { id } = body.json as { id: string };

    expect(id).toMatch(UUID_V7);
    expect({ status, body }).toEqual({
      status: 200,
      body: {
        json: {
          id,
          organizationId,
          slug: "acme",
          name: "Acme",
          visibility: "public",
          source: { kind: "managed", artifactsRepo: id },
          createdAt: "2026-01-01T00:00:00.000Z",
        },
        meta: [[1, "createdAt"]],
      },
    });
  });

  it("refuses a slug another organization already uses", async () => {
    const first = await organizationMember("taken-a@example.com", "Taken A");
    const second = await organizationMember("taken-b@example.com", "Taken B");
    await createSite(first.client, "taken", "First");

    expect(await second.client.rpc("sites/create", { slug: "taken", name: "Second" })).toEqual({
      status: 409,
      body: {
        json: {
          defined: true,
          code: "SLUG_TAKEN",
          status: 409,
          message: "Another site already uses this address",
        },
      },
    });
    expect((await second.client.rpc("sites/list")).body).toEqual({ json: [] });
  });

  it.each([
    ["www", { code: "custom", message: "This address is reserved", path: ["slug"] }],
    [
      "acme--docs",
      {
        code: "invalid_format",
        format: "regex",
        origin: "string",
        pattern: "/^[a-z0-9]+(-[a-z0-9]+)*$/",
        message: "Use lowercase letters, digits and single hyphens",
        path: ["slug"],
      },
    ],
  ])("rejects the slug %s", async (slug, issue) => {
    const { client } = await organizationMember(`invalid-${slug}@example.com`, `Invalid ${slug}`);
    expect(await client.rpc("sites/create", { slug, name: "Invalid" })).toEqual({
      status: 400,
      body: {
        json: {
          defined: false,
          code: "BAD_REQUEST",
          status: 400,
          message: "Input validation failed",
          data: { issues: [issue] },
        },
      },
    });
  });

  it("requires payment once the trial is over", async () => {
    const { client } = await organizationMember("expired@example.com", "Expired");
    vi.setSystemTime(JAN_1.getTime() + 31 * DAY);
    await client.post("/auth/sign-in/email", {
      email: "expired@example.com",
      password: "password123",
    });

    expect(await client.rpc("sites/create", { slug: "expired", name: "Expired" })).toEqual({
      status: 402,
      body: {
        json: {
          defined: true,
          code: "PAYMENT_REQUIRED",
          status: 402,
          message: "An active subscription is required",
          data: { reason: "trial_expired" },
        },
      },
    });
    expect((await client.rpc("sites/list")).body).toEqual({ json: [] });
  });
});

describe("sites.list", () => {
  it("returns only the active organization's sites", async () => {
    const a = await organizationMember("list-a@example.com", "List A");
    const b = await organizationMember("list-b@example.com", "List B");
    const alpha = await createSite(a.client, "alpha", "Alpha");
    vi.setSystemTime(JAN_1.getTime() + MINUTE);
    const beta = await createSite(b.client, "beta", "Beta");

    expect(await a.client.rpc("sites/list")).toEqual({
      status: 200,
      body: {
        json: [
          {
            id: alpha.id,
            organizationId: a.organizationId,
            slug: "alpha",
            name: "Alpha",
            visibility: "public",
            source: { kind: "managed", artifactsRepo: alpha.id },
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        meta: [[1, 0, "createdAt"]],
      },
    });
    expect(await b.client.rpc("sites/list")).toEqual({
      status: 200,
      body: {
        json: [
          {
            id: beta.id,
            organizationId: b.organizationId,
            slug: "beta",
            name: "Beta",
            visibility: "public",
            source: { kind: "managed", artifactsRepo: beta.id },
            createdAt: "2026-01-01T00:01:00.000Z",
          },
        ],
        meta: [[1, 0, "createdAt"]],
      },
    });
  });
});
