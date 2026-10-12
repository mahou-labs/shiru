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

async function createDoc(client: ReturnType<typeof createClient>, slug: string, name: string) {
  const { status, body } = await client.rpc("docs/create", { slug, name, visibility: "public" });
  expect(status).toBe(200);
  return body.json as { id: string };
}

describe("docs.create", () => {
  it("creates a managed doc whose repo is named after the doc id", async () => {
    const { client, organizationId } = await organizationMember("create@example.com", "Create");
    const { status, body } = await client.rpc("docs/create", {
      slug: "acme",
      name: " Acme ",
      visibility: "public",
    });
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
          url: "http://acme.docs.localhost:3003",
        },
        meta: [[1, "createdAt"]],
      },
    });
  });

  it("refuses a slug another organization already uses", async () => {
    const first = await organizationMember("taken-a@example.com", "Taken A");
    const second = await organizationMember("taken-b@example.com", "Taken B");
    await createDoc(first.client, "taken", "First");

    expect(
      await second.client.rpc("docs/create", {
        slug: "taken",
        name: "Second",
        visibility: "public",
      }),
    ).toEqual({
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
    expect((await second.client.rpc("docs/list")).body).toEqual({ json: [] });
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
    expect(
      await client.rpc("docs/create", { slug, name: "Invalid", visibility: "public" }),
    ).toEqual({
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

    expect(
      await client.rpc("docs/create", {
        slug: "expired",
        name: "Expired",
        visibility: "public",
      }),
    ).toEqual({
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
    expect((await client.rpc("docs/list")).body).toEqual({ json: [] });
  });
});

describe("docs.list", () => {
  it("returns only the active organization's docs", async () => {
    const a = await organizationMember("list-a@example.com", "List A");
    const b = await organizationMember("list-b@example.com", "List B");
    const alpha = await createDoc(a.client, "alpha", "Alpha");
    vi.setSystemTime(JAN_1.getTime() + MINUTE);
    const beta = await createDoc(b.client, "beta", "Beta");

    expect(await a.client.rpc("docs/list")).toEqual({
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
            url: "http://alpha.docs.localhost:3003",
          },
        ],
        meta: [[1, 0, "createdAt"]],
      },
    });
    expect(await b.client.rpc("docs/list")).toEqual({
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
            url: "http://beta.docs.localhost:3003",
          },
        ],
        meta: [[1, 0, "createdAt"]],
      },
    });
  });
});

describe("one public doc per organization", () => {
  const PUBLIC_DOC_EXISTS = {
    status: 409,
    body: {
      json: {
        defined: true,
        code: "PUBLIC_DOC_EXISTS",
        status: 409,
        message: "This organization already has a public docs site",
      },
    },
  };

  it("refuses a second public doc under a free address", async () => {
    const { client } = await organizationMember("second@example.com", "Second");
    const first = await createDoc(client, "second-one", "One");

    expect(
      await client.rpc("docs/create", { slug: "second-two", name: "Two", visibility: "public" }),
    ).toEqual(PUBLIC_DOC_EXISTS);
    expect(await client.rpc("docs/checkSlug", { slug: "second-two" })).toEqual({
      status: 200,
      body: { json: { available: true } },
    });
    const listed = (await client.rpc("docs/list")).body.json as { id: string }[];
    expect(listed.map(({ id }) => id)).toEqual([first.id]);
  });

  it("reports the public doc, not the address, when both conflict", async () => {
    const other = await organizationMember("both-a@example.com", "Both A");
    const { client } = await organizationMember("both-b@example.com", "Both B");
    await createDoc(other.client, "both-taken", "Other");
    await createDoc(client, "both-mine", "Mine");

    expect(
      await client.rpc("docs/create", { slug: "both-taken", name: "Two", visibility: "public" }),
    ).toEqual(PUBLIC_DOC_EXISTS);
  });

  it("lets exactly one of two concurrent creates through", async () => {
    const { client } = await organizationMember("race@example.com", "Race");

    const results = await Promise.all([
      client.rpc("docs/create", { slug: "race-one", name: "One", visibility: "public" }),
      client.rpc("docs/create", { slug: "race-two", name: "Two", visibility: "public" }),
    ]);

    expect(results.map(({ status }) => status).sort((a, b) => a - b)).toEqual([200, 409]);
    expect(results.find(({ status }) => status === 409)).toEqual(PUBLIC_DOC_EXISTS);
  });

  it("allows a public doc in each organization", async () => {
    const a = await organizationMember("each-a@example.com", "Each A");
    const b = await organizationMember("each-b@example.com", "Each B");
    await createDoc(a.client, "each-a", "A");

    const created = await b.client.rpc("docs/create", {
      slug: "each-b",
      name: "B",
      visibility: "public",
    });
    expect(created.status).toBe(200);
  });

  it("does not accept internal docs yet", async () => {
    const { client } = await organizationMember("internal@example.com", "Internal");

    expect(
      await client.rpc("docs/create", {
        slug: "internal",
        name: "Internal",
        visibility: "internal",
      }),
    ).toEqual({
      status: 400,
      body: {
        json: {
          defined: false,
          code: "BAD_REQUEST",
          status: 400,
          message: "Input validation failed",
          data: {
            issues: [
              {
                code: "invalid_value",
                values: ["public"],
                message: 'Invalid input: expected "public"',
                path: ["visibility"],
              },
            ],
          },
        },
      },
    });
  });
});

describe("docs.checkSlug", () => {
  it("reports a slug as taken once any organization uses it", async () => {
    const owner = await organizationMember("check-a@example.com", "Check A");
    const { client } = await organizationMember("check-b@example.com", "Check B");

    expect(await client.rpc("docs/checkSlug", { slug: "check" })).toEqual({
      status: 200,
      body: { json: { available: true } },
    });
    await createDoc(owner.client, "check", "Check");
    expect(await client.rpc("docs/checkSlug", { slug: "check" })).toEqual({
      status: 200,
      body: { json: { available: false } },
    });
  });

  it("rejects a reserved slug", async () => {
    const { client } = await organizationMember("check-reserved@example.com", "Check Reserved");

    expect(await client.rpc("docs/checkSlug", { slug: "app" })).toEqual({
      status: 400,
      body: {
        json: {
          defined: false,
          code: "BAD_REQUEST",
          status: 400,
          message: "Input validation failed",
          data: {
            issues: [{ code: "custom", message: "This address is reserved", path: ["slug"] }],
          },
        },
      },
    });
  });
});

describe("docs.docsDomain", () => {
  it("returns the domain docs are served under", async () => {
    const { client } = await organizationMember("domain@example.com", "Domain");

    expect(await client.rpc("docs/docsDomain")).toEqual({
      status: 200,
      body: { json: "docs.localhost" },
    });
  });
});
