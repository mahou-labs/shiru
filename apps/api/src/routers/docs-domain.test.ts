import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { hostnames } from "../schema/docs";
import { createCustomHostname } from "../domains/cloudflare";
import { db, domainsKv, env } from "../test/bindings";
import { createClient } from "../test/client";
import { FakeCloudflareZone, HOSTNAMES, ZONE_ID, ZONE_TOKEN } from "../test/cloudflare-zone";

const JAN_1 = new Date("2026-01-01T00:00:00.000Z");
const DAY = 24 * 60 * 60 * 1000;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(JAN_1);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  env.ENVIRONMENT = "development";
  env.CUSTOM_HOSTNAMES_ZONE_ID = "test-zone";
  env.CUSTOM_HOSTNAMES_API_TOKEN = "test-hostnames-token";
});

async function docOwner(slug: string) {
  const client = createClient();
  await client.signUpVerified(`${slug}@mailinator.com`);
  await client.createOrganization(`Org ${slug}`);
  const { body } = await client.rpc("docs/create", { slug, name: "Docs", visibility: "public" });
  return { client, docId: (body.json as { id: string }).id };
}

const kv = (...keys: string[]) => keys.map((key) => domainsKv.entries.get(key) ?? null);

const error = (status: number, code: string, message: string, data?: unknown) => ({
  status,
  body: {
    json: { defined: true, code, status, message, ...(data === undefined ? {} : { data }) },
  },
});

describe("docs.domain", () => {
  it("adds, reads and removes a custom domain, active at once in development", async () => {
    const { client, docId } = await docOwner("happy");
    const domain = {
      hostname: "docs.happy.com",
      status: "active",
      record: { type: "CNAME", name: "docs.happy.com", target: "cname.docs.localhost" },
      errors: [],
    };

    expect(await client.rpc("docs/domain/get", { docId })).toEqual({
      status: 200,
      body: { json: null },
    });
    expect(await client.rpc("docs/domain/check", { docId })).toEqual({
      status: 200,
      body: { json: null },
    });
    expect(await client.rpc("docs/domain/add", { docId, hostname: " Docs.Happy.com. " })).toEqual({
      status: 200,
      body: { json: domain },
    });
    expect(await client.rpc("docs/domain/get", { docId })).toEqual({
      status: 200,
      body: { json: domain },
    });
    expect(await client.rpc("docs/domain/check", { docId })).toEqual({
      status: 200,
      body: { json: domain },
    });
    expect(kv("host:docs.happy.com", "redirect:happy")).toEqual(["happy", "docs.happy.com"]);
    // The dev dispatch Worker cannot serve custom domains, so the doc keeps its local address.
    const listed = (await client.rpc("docs/list")).body.json as { url: string }[];
    expect(listed.map(({ url }) => url)).toEqual(["http://happy.docs.localhost:3003"]);

    expect(await client.rpc("docs/domain/remove", { docId })).toEqual({
      status: 200,
      body: { json: { removed: true } },
    });
    expect(await client.rpc("docs/domain/get", { docId })).toEqual({
      status: 200,
      body: { json: null },
    });
    expect(kv("host:docs.happy.com", "redirect:happy")).toEqual([null, null]);
    expect(await client.rpc("docs/domain/remove", { docId })).toEqual({
      status: 200,
      body: { json: { removed: true } },
    });
  });

  it("lists a doc at its active custom domain in production", async () => {
    const { client, docId } = await docOwner("listed");
    await client.rpc("docs/domain/add", { docId, hostname: "docs.listed.com" });

    env.ENVIRONMENT = "production";
    const listed = (await client.rpc("docs/list")).body.json as { url: string }[];
    expect(listed.map(({ url }) => url)).toEqual(["https://docs.listed.com"]);
  });

  it("returns a domain that is not active yet as stored, since development has no Cloudflare", async () => {
    const { client, docId } = await docOwner("stored");
    await db.insert(hostnames).values({
      hostname: "docs.stored.com",
      docId,
      cloudflareId: null,
      status: "failed",
      createdAt: JAN_1,
    });

    const stored = {
      status: 200,
      body: {
        json: {
          hostname: "docs.stored.com",
          status: "failed",
          record: { type: "CNAME", name: "docs.stored.com", target: "cname.docs.localhost" },
          errors: [],
        },
      },
    };
    expect(await client.rpc("docs/domain/get", { docId })).toEqual(stored);
    expect(await client.rpc("docs/domain/check", { docId })).toEqual(stored);
    const listed = (await client.rpc("docs/list")).body.json as { url: string }[];
    env.ENVIRONMENT = "production";
    const inProduction = (await client.rpc("docs/list")).body.json as { url: string }[];
    expect([...listed, ...inProduction].map(({ url }) => url)).toEqual([
      "http://stored.docs.localhost:3003",
      "https://stored.docs.localhost",
    ]);
  });

  it("has Cloudflare check a pending domain again in production and returns its new status", async () => {
    const { client, docId } = await docOwner("checked");
    const cloudflare = new FakeCloudflareZone();
    const realFetch = globalThis.fetch;
    // The route calls Cloudflare with the global fetch, so only Cloudflare's API goes to the fake.
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) =>
      new Request(input, init).url.startsWith(HOSTNAMES)
        ? cloudflare.fetch(input, init)
        : realFetch(input, init),
    );
    const zone = { id: ZONE_ID, apiToken: ZONE_TOKEN };
    await createCustomHostname({ zone, hostname: "docs.checked.com", fetch: cloudflare.fetch });
    await db.insert(hostnames).values({
      hostname: "docs.checked.com",
      docId,
      cloudflareId: "ch-1",
      status: "pending",
      createdAt: JAN_1,
    });
    Object.assign(env, {
      ENVIRONMENT: "production",
      CUSTOM_HOSTNAMES_ZONE_ID: ZONE_ID,
      CUSTOM_HOSTNAMES_API_TOKEN: ZONE_TOKEN,
    });
    cloudflare.activate("ch-1");

    expect(await client.rpc("docs/domain/check", { docId })).toEqual({
      status: 200,
      body: {
        json: {
          hostname: "docs.checked.com",
          status: "active",
          record: { type: "CNAME", name: "docs.checked.com", target: "cname.docs.localhost" },
          errors: [],
        },
      },
    });
    expect(cloudflare.requests.slice(1)).toEqual([
      {
        method: "PATCH",
        url: `${HOSTNAMES}/ch-1`,
        authorization: `Bearer ${ZONE_TOKEN}`,
        json: { ssl: { method: "http", type: "dv" } },
      },
    ]);
    expect(kv("host:docs.checked.com", "redirect:checked")).toEqual([
      "checked",
      "docs.checked.com",
    ]);
  });

  it("allows one domain per doc", async () => {
    const { client, docId } = await docOwner("single");
    await client.rpc("docs/domain/add", { docId, hostname: "docs.single.com" });

    expect(await client.rpc("docs/domain/add", { docId, hostname: "help.single.com" })).toEqual(
      error(409, "DOMAIN_EXISTS", "This site already has a custom domain"),
    );
  });

  it("refuses a domain another organization's doc uses", async () => {
    const owner = await docOwner("owner");
    const other = await docOwner("other");
    await owner.client.rpc("docs/domain/add", { docId: owner.docId, hostname: "docs.owner.com" });

    expect(
      await other.client.rpc("docs/domain/add", {
        docId: other.docId,
        hostname: "docs.owner.com",
      }),
    ).toEqual(error(409, "HOSTNAME_TAKEN", "Another site already uses this domain"));
    expect(kv("host:docs.owner.com")).toEqual(["owner"]);
  });

  it("refuses a Shiru docs or preview address", async () => {
    const { client, docId } = await docOwner("shiru-address");
    const notAllowed = error(400, "HOSTNAME_NOT_ALLOWED", "This domain is already a Shiru address");

    expect(await client.rpc("docs/domain/add", { docId, hostname: "x.docs.localhost" })).toEqual(
      notAllowed,
    );
    expect(
      await client.rpc("docs/domain/add", { docId, hostname: "a--b.preview.docs.localhost" }),
    ).toEqual(notAllowed);
  });

  it("rejects a hostname that is not a domain", async () => {
    const { client, docId } = await docOwner("invalid");

    expect(await client.rpc("docs/domain/add", { docId, hostname: "not a host" })).toEqual({
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
                code: "custom",
                message: "Enter a domain like docs.example.com",
                path: ["hostname"],
              },
            ],
          },
        },
      },
    });
  });

  it("hides another organization's doc behind NOT_FOUND", async () => {
    const { client: owner, docId } = await docOwner("hidden");
    await owner.rpc("docs/domain/add", { docId, hostname: "docs.hidden.com" });
    const { client: stranger } = await docOwner("stranger");
    const notFound = error(404, "NOT_FOUND", "Site not found");

    expect(
      await Promise.all([
        stranger.rpc("docs/domain/get", { docId }),
        stranger.rpc("docs/domain/check", { docId }),
        stranger.rpc("docs/domain/add", { docId, hostname: "docs.stranger.com" }),
        stranger.rpc("docs/domain/remove", { docId }),
      ]),
    ).toEqual([notFound, notFound, notFound, notFound]);
    expect(kv("host:docs.hidden.com", "host:docs.stranger.com")).toEqual(["hidden", null]);
  });

  it("requires payment to add a domain, but not to see or remove one", async () => {
    const { client, docId } = await docOwner("lapsed");
    await client.rpc("docs/domain/add", { docId, hostname: "docs.lapsed.com" });
    vi.setSystemTime(JAN_1.getTime() + 31 * DAY);
    await client.post("/auth/sign-in/email", {
      email: "lapsed@mailinator.com",
      password: "password123",
    });

    expect(await client.rpc("docs/domain/remove", { docId })).toEqual({
      status: 200,
      body: { json: { removed: true } },
    });
    expect(await client.rpc("docs/domain/add", { docId, hostname: "docs.lapsed.com" })).toEqual(
      error(402, "PAYMENT_REQUIRED", "An active subscription is required", {
        reason: "trial_expired",
      }),
    );
    expect(await client.rpc("docs/domain/get", { docId })).toEqual({
      status: 200,
      body: { json: null },
    });
  });

  it("answers 503 while production lacks the Cloudflare token", async () => {
    const { client, docId } = await docOwner("unconfigured");
    const other = await docOwner("unconfigured-other");
    await db.insert(hostnames).values({
      hostname: "docs.unconfigured.com",
      docId,
      cloudflareId: "ch-1",
      status: "pending",
      createdAt: JAN_1,
    });
    env.ENVIRONMENT = "production";
    env.CUSTOM_HOSTNAMES_API_TOKEN = "";
    const notConfigured = error(
      503,
      "NOT_CONFIGURED",
      "Custom domains are not configured: CUSTOM_HOSTNAMES_API_TOKEN is not set",
    );

    expect(
      await Promise.all([
        client.rpc("docs/domain/get", { docId }),
        client.rpc("docs/domain/check", { docId }),
        client.rpc("docs/domain/remove", { docId }),
        other.client.rpc("docs/domain/add", {
          docId: other.docId,
          hostname: "docs.unconfigured-other.com",
        }),
      ]),
    ).toEqual([notConfigured, notConfigured, notConfigured, notConfigured]);
    expect(kv("host:docs.unconfigured-other.com")).toEqual([null]);
  });
});
