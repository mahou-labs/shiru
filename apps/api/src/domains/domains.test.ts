import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import type { Doc } from "../docs/doc";
import { buildCommit } from "../docs/git";
import { LIVE } from "../docs/names";
import { docs, hostnames } from "../schema/docs";
import { artifacts, db, docObjects, domainsKv, env, publishWorkflow } from "../test/bindings";
import { createClient } from "../test/client";
import { FakeCloudflareZone, HOSTNAMES, ZONE_ID, ZONE_TOKEN } from "../test/cloudflare-zone";
import {
  addDomain,
  docUrl,
  type DomainsEnv,
  refreshDomain,
  refreshDomains,
  removeDomain,
} from "./domains";

const JAN_1 = new Date("2026-01-01T00:00:00.000Z");

const development = { ENVIRONMENT: env.ENVIRONMENT, DOCS_DOMAIN: env.DOCS_DOMAIN };

// The Doc reads the shared bindings when a build starts, so its builds get production URLs too.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(JAN_1);
  Object.assign(env, { ENVIRONMENT: "production", DOCS_DOMAIN: "shiru.page" });
});
afterEach(() => {
  vi.useRealTimers();
  Object.assign(env, development);
});

const production = {
  ...env,
  ENVIRONMENT: "production",
  DOCS_DOMAIN: "shiru.page",
  CUSTOM_HOSTNAMES_ZONE_ID: ZONE_ID,
  CUSTOM_HOSTNAMES_API_TOKEN: ZONE_TOKEN,
  CUSTOM_DOMAIN_TARGET: "cname.shiru.page",
} as unknown as DomainsEnv;

async function createDoc(slug: string) {
  const client = createClient();
  await client.signUpVerified(`${slug}@mailinator.com`);
  await client.createOrganization(`Org ${slug}`);
  const { body } = await client.rpc("docs/create", {
    slug,
    name: "Acme Docs",
    visibility: "public",
  });
  return { client, docId: (body.json as { id: string }).id };
}

/** Publishes a first commit and reports its build as deployed, so the doc has a live build. */
async function publishLive(client: ReturnType<typeof createClient>, docId: string) {
  await artifacts.create(docId);
  const commit = await buildCommit({
    tree: [],
    changes: [{ path: "docs/content/index.mdx", op: "put", content: new Uint8Array([35]) }],
    parent: null,
    author: { name: "Dev", email: "dev@example.com" },
    message: "import",
    time: 1760000000,
  });
  artifacts.receive(docId, commit.objects, commit.sha);
  await client.rpc("docs/publish", { docId });
  const [workflowId] = startedBuilds(docId);
  const doc = docObjects.getByName(docId) as unknown as Pick<Doc, "buildFinished">;
  await doc.buildFinished(LIVE, workflowId!, { ok: true, templateVersion: "v1" });
  return commit.sha;
}

const startedBuilds = (docId: string) =>
  [...publishWorkflow.created.keys()].filter((id) => id.startsWith(docId));
const builtUrls = (docId: string) =>
  startedBuilds(docId).map((id) => publishWorkflow.created.get(id)!.docUrl);

async function site(docId: string) {
  const [doc] = await db.select().from(docs).where(eq(docs.id, docId));
  const [row] = await db.select().from(hostnames).where(eq(hostnames.docId, docId));
  return { doc: doc!, row: row ?? null };
}

/** The doc and the domain it has, for the calls that need one. */
async function withDomain(docId: string) {
  const { doc, row } = await site(docId);
  return { doc, row: row! };
}

const kv = (...keys: string[]) => keys.map((key) => domainsKv.entries.get(key) ?? null);

describe("addDomain", () => {
  it("registers the hostname with Cloudflare and routes it to the doc while it is pending", async () => {
    const { docId } = await createDoc("adding");
    const cloudflare = new FakeCloudflareZone();
    const { doc } = await site(docId);

    expect(
      await addDomain({
        env: production,
        fetch: cloudflare.fetch,
        doc,
        hostname: "docs.adding.com",
      }),
    ).toEqual({
      ok: true,
      domain: {
        hostname: "docs.adding.com",
        status: "pending",
        record: { type: "CNAME", name: "docs.adding.com", target: "cname.shiru.page" },
        errors: ["custom hostname does not CNAME to this zone."],
      },
    });
    expect((await site(docId)).row).toEqual({
      hostname: "docs.adding.com",
      docId,
      cloudflareId: "ch-1",
      status: "pending",
      createdAt: JAN_1,
    });
    expect(kv("host:docs.adding.com", "redirect:adding")).toEqual(["adding", null]);
    expect(cloudflare.requests.map(({ method, url, json }) => [method, url, json])).toEqual([
      ["POST", HOSTNAMES, { hostname: "docs.adding.com", ssl: { method: "http", type: "dv" } }],
    ]);
  });

  it("reports a doc that already has a domain and a hostname another doc uses", async () => {
    const first = await createDoc("first-site");
    const second = await createDoc("second-site");
    const cloudflare = new FakeCloudflareZone();
    const add = async (docId: string, hostname: string) =>
      addDomain({
        env: production,
        fetch: cloudflare.fetch,
        doc: (await site(docId)).doc,
        hostname,
      });

    expect((await add(first.docId, "docs.first.com")).ok).toBe(true);
    expect(await add(first.docId, "help.first.com")).toEqual({
      ok: false,
      error: { code: "DOMAIN_EXISTS" },
    });
    expect(await add(second.docId, "docs.first.com")).toEqual({
      ok: false,
      error: { code: "HOSTNAME_TAKEN" },
    });
    expect([...cloudflare.hostnames.values()].map(({ hostname }) => hostname)).toEqual([
      "docs.first.com",
    ]);
  });

  it("lets one of two concurrent adds through and deletes the loser's Cloudflare hostname", async () => {
    const { docId } = await createDoc("racing");
    const cloudflare = new FakeCloudflareZone();
    const { doc } = await site(docId);
    const add = (hostname: string) =>
      addDomain({ env: production, fetch: cloudflare.fetch, doc, hostname });

    const results = await Promise.all([add("one.racing.com"), add("two.racing.com")]);

    expect(results.map((result) => (result.ok ? result.domain.hostname : result.error))).toEqual([
      "one.racing.com",
      { code: "DOMAIN_EXISTS" },
    ]);
    expect([...cloudflare.hostnames.values()].map(({ hostname }) => hostname)).toEqual([
      "one.racing.com",
    ]);
    expect(kv("host:one.racing.com", "host:two.racing.com")).toEqual(["racing", null]);
  });

  it("returns Cloudflare's refusal and stores nothing", async () => {
    const { docId } = await createDoc("refused");
    const cloudflare = new FakeCloudflareZone();
    cloudflare.failNext("POST", HOSTNAMES, 400, {
      success: false,
      errors: [{ code: 1409, message: "Hostname is not allowed." }],
      result: null,
    });

    expect(
      await addDomain({
        env: production,
        fetch: cloudflare.fetch,
        doc: (await site(docId)).doc,
        hostname: "docs.refused.com",
      }),
    ).toEqual({
      ok: false,
      error: { code: "HOSTNAME_REJECTED", message: "Hostname is not allowed." },
    });
    expect((await site(docId)).row).toBe(null);
    expect(kv("host:docs.refused.com")).toEqual([null]);
  });

  it("throws when Cloudflare fails in a way a retry may fix", async () => {
    const { docId } = await createDoc("unavailable");
    const cloudflare = new FakeCloudflareZone();
    cloudflare.failNext("POST", HOSTNAMES, 503, "Service unavailable");

    await expect(
      addDomain({
        env: production,
        fetch: cloudflare.fetch,
        doc: (await site(docId)).doc,
        hostname: "docs.unavailable.com",
      }),
    ).rejects.toThrow(
      "Cloudflare custom hostname create failed (HTTP 503): HTTP 503: Service unavailable",
    );
    expect((await site(docId)).row).toBe(null);
  });
});

describe("refreshDomain", () => {
  it("serves the doc at its domain once active, and back at its address once it breaks", async () => {
    const { client, docId } = await createDoc("moving");
    const sha = await publishLive(client, docId);
    const cloudflare = new FakeCloudflareZone();
    const deps = { env: production, fetch: cloudflare.fetch };
    await addDomain({ ...deps, doc: (await site(docId)).doc, hostname: "docs.moving.com" });

    expect(await refreshDomain({ ...deps, ...(await withDomain(docId)) })).toMatchObject({
      ok: true,
      domain: { status: "pending" },
    });
    expect(builtUrls(docId)).toEqual(["https://moving.shiru.page"]);

    cloudflare.activate("ch-1");
    expect(await refreshDomain({ ...deps, ...(await withDomain(docId)) })).toEqual({
      ok: true,
      domain: {
        hostname: "docs.moving.com",
        status: "active",
        record: { type: "CNAME", name: "docs.moving.com", target: "cname.shiru.page" },
        errors: [],
      },
    });
    expect((await site(docId)).row?.status).toBe("active");
    expect(kv("host:docs.moving.com", "redirect:moving")).toEqual(["moving", "docs.moving.com"]);
    expect(builtUrls(docId)).toEqual(["https://moving.shiru.page", "https://docs.moving.com"]);
    expect(publishWorkflow.created.get(startedBuilds(docId)[1]!)?.sha).toBe(sha);

    cloudflare.update("ch-1", { status: "moved" });
    expect(await refreshDomain({ ...deps, ...(await withDomain(docId)) })).toMatchObject({
      ok: true,
      domain: { status: "failed", errors: [] },
    });
    expect(kv("host:docs.moving.com", "redirect:moving")).toEqual(["moving", null]);
    // The rebuild for the domain is still running, so the next build waits for it.
    expect(builtUrls(docId)).toHaveLength(2);
    const doc = docObjects.getByName(docId) as unknown as Pick<Doc, "buildFinished">;
    await doc.buildFinished(LIVE, startedBuilds(docId)[1]!, { ok: true, templateVersion: "v1" });
    expect(builtUrls(docId)).toEqual([
      "https://moving.shiru.page",
      "https://docs.moving.com",
      "https://moving.shiru.page",
    ]);
  });

  it("fails a domain Cloudflare no longer has", async () => {
    const { docId } = await createDoc("vanished");
    const cloudflare = new FakeCloudflareZone();
    const deps = { env: production, fetch: cloudflare.fetch };
    await addDomain({ ...deps, doc: (await site(docId)).doc, hostname: "docs.vanished.com" });
    cloudflare.hostnames.clear();

    expect(await refreshDomain({ ...deps, ...(await withDomain(docId)) })).toMatchObject({
      ok: true,
      domain: { status: "failed", errors: ["Cloudflare no longer has this domain"] },
    });
    expect((await site(docId)).row?.status).toBe("failed");
  });
});

describe("refreshDomain with revalidate", () => {
  it("has Cloudflare check the domain again instead of only reading it", async () => {
    const { docId } = await createDoc("recheck");
    const cloudflare = new FakeCloudflareZone();
    const deps = { env: production, fetch: cloudflare.fetch };
    await addDomain({ ...deps, doc: (await site(docId)).doc, hostname: "docs.recheck.com" });
    cloudflare.activate("ch-1");

    expect(
      await refreshDomain({ ...deps, ...(await withDomain(docId)), revalidate: true }),
    ).toEqual({
      ok: true,
      domain: {
        hostname: "docs.recheck.com",
        status: "active",
        record: { type: "CNAME", name: "docs.recheck.com", target: "cname.shiru.page" },
        errors: [],
      },
    });
    expect(cloudflare.requests.slice(1).map(({ method, url }) => [method, url])).toEqual([
      ["PATCH", `${HOSTNAMES}/ch-1`],
    ]);
    expect((await site(docId)).row?.status).toBe("active");
    expect(kv("host:docs.recheck.com", "redirect:recheck")).toEqual([
      "recheck",
      "docs.recheck.com",
    ]);
  });

  it("does not call Cloudflare for a domain being removed", async () => {
    const { docId } = await createDoc("recheck-removing");
    const cloudflare = new FakeCloudflareZone();
    const deps = { env: production, fetch: cloudflare.fetch };
    await addDomain({
      ...deps,
      doc: (await site(docId)).doc,
      hostname: "docs.recheck-removing.com",
    });
    await db.update(hostnames).set({ status: "removing" }).where(eq(hostnames.docId, docId));

    expect(
      await refreshDomain({ ...deps, ...(await withDomain(docId)), revalidate: true }),
    ).toMatchObject({ ok: true, domain: { status: "removing" } });
    expect(cloudflare.requests.map(({ method }) => method)).toEqual(["POST"]);
  });
});

describe("removeDomain", () => {
  it("deletes the Cloudflare hostname, its routing and the row, and serves the doc at its address", async () => {
    const { client, docId } = await createDoc("leaving");
    await publishLive(client, docId);
    const cloudflare = new FakeCloudflareZone();
    const deps = { env: production, fetch: cloudflare.fetch };
    await addDomain({ ...deps, doc: (await site(docId)).doc, hostname: "docs.leaving.com" });
    cloudflare.activate("ch-1");
    await refreshDomain({ ...deps, ...(await withDomain(docId)) });
    const doc = docObjects.getByName(docId) as unknown as Pick<Doc, "buildFinished">;
    await doc.buildFinished(LIVE, startedBuilds(docId)[1]!, { ok: true, templateVersion: "v1" });

    expect(await removeDomain({ ...deps, ...(await withDomain(docId)) })).toEqual({ ok: true });
    expect(cloudflare.hostnames.size).toBe(0);
    expect(kv("host:docs.leaving.com", "redirect:leaving")).toEqual([null, null]);
    expect((await site(docId)).row).toBe(null);
    expect(builtUrls(docId)).toEqual([
      "https://leaving.shiru.page",
      "https://docs.leaving.com",
      "https://leaving.shiru.page",
    ]);
  });

  it("stops serving at once and keeps the row while Cloudflare fails, so removing can be tried again", async () => {
    const { docId } = await createDoc("stuck");
    const cloudflare = new FakeCloudflareZone();
    const deps = { env: production, fetch: cloudflare.fetch };
    await addDomain({ ...deps, doc: (await site(docId)).doc, hostname: "docs.stuck.com" });
    cloudflare.failNext("DELETE", `${HOSTNAMES}/ch-1`, 500, "Internal error");

    await expect(removeDomain({ ...deps, ...(await withDomain(docId)) })).rejects.toThrow(
      "Cloudflare custom hostname delete failed (HTTP 500): HTTP 500: Internal error",
    );
    expect((await site(docId)).row?.status).toBe("removing");
    expect(kv("host:docs.stuck.com")).toEqual([null]);

    expect(await removeDomain({ ...deps, ...(await withDomain(docId)) })).toEqual({ ok: true });
    expect((await site(docId)).row).toBe(null);
  });

  it("is not undone by a sync that read the domain before it was removed", async () => {
    const { client, docId } = await createDoc("stale");
    await publishLive(client, docId);
    const cloudflare = new FakeCloudflareZone();
    const deps = { env: production, fetch: cloudflare.fetch };
    await addDomain({ ...deps, doc: (await site(docId)).doc, hostname: "docs.stale.com" });
    const stale = await withDomain(docId);
    cloudflare.activate("ch-1");
    const answered = cloudflare.fetch;
    let removed: Promise<unknown> | undefined;
    // Cloudflare answers the sync, then the domain is removed before the sync writes anything.
    const fetch: typeof globalThis.fetch = async (input, init) => {
      const response = await answered(input, init);
      if (init?.method === undefined || init.method === "GET") {
        removed ??= removeDomain({ ...deps, ...(await withDomain(docId)) });
        await removed;
      }
      return response;
    };

    expect(await refreshDomain({ ...deps, fetch, ...stale })).toEqual({ ok: true, domain: null });
    expect((await site(docId)).row).toBe(null);
    expect(kv("host:docs.stale.com", "redirect:stale")).toEqual([null, null]);
    expect(builtUrls(docId)).toEqual(["https://stale.shiru.page"]);
  });
});

describe("routing repair", () => {
  it("clears the redirect of a broken domain on the next cron run when clearing it failed", async () => {
    await db.delete(hostnames);
    const { docId } = await createDoc("broken");
    const cloudflare = new FakeCloudflareZone();
    const deps = { env: production, fetch: cloudflare.fetch };
    await addDomain({ ...deps, doc: (await site(docId)).doc, hostname: "docs.broken.com" });
    cloudflare.activate("ch-1");
    await refreshDomain({ ...deps, ...(await withDomain(docId)) });
    cloudflare.update("ch-1", { status: "moved" });
    const remove = vi.spyOn(domainsKv, "delete").mockRejectedValueOnce(new Error("KV unavailable"));

    await expect(refreshDomain({ ...deps, ...(await withDomain(docId)) })).rejects.toThrow(
      "KV unavailable",
    );
    remove.mockRestore();
    expect((await site(docId)).row?.status).toBe("failed");
    expect(kv("redirect:broken")).toEqual(["docs.broken.com"]);

    await refreshDomains(deps);
    expect(kv("host:docs.broken.com", "redirect:broken")).toEqual(["broken", null]);
  });

  it("writes a host key that failed to write when the domain was added", async () => {
    const { docId } = await createDoc("repaired");
    const cloudflare = new FakeCloudflareZone();
    const deps = { env: production, fetch: cloudflare.fetch };
    const put = vi.spyOn(domainsKv, "put").mockRejectedValueOnce(new Error("KV unavailable"));

    await expect(
      addDomain({ ...deps, doc: (await site(docId)).doc, hostname: "docs.repaired.com" }),
    ).rejects.toThrow("KV unavailable");
    put.mockRestore();
    expect(kv("host:docs.repaired.com")).toEqual([null]);

    cloudflare.activate("ch-1");
    expect(await refreshDomain({ ...deps, ...(await withDomain(docId)) })).toMatchObject({
      ok: true,
      domain: { status: "active" },
    });
    expect(kv("host:docs.repaired.com", "redirect:repaired")).toEqual([
      "repaired",
      "docs.repaired.com",
    ]);
  });
});

describe("an old registration", () => {
  async function registeredAgain(slug: string) {
    const { docId } = await createDoc(slug);
    const cloudflare = new FakeCloudflareZone();
    const deps = { env: production, fetch: cloudflare.fetch };
    const hostname = `docs.${slug}.com`;
    await addDomain({ ...deps, doc: (await site(docId)).doc, hostname });
    const old = await withDomain(docId);
    await removeDomain({ ...deps, ...old });
    vi.setSystemTime(new Date(JAN_1.getTime() + 1000));
    await addDomain({ ...deps, doc: old.doc, hostname });
    return { cloudflare, deps, docId, old };
  }

  it("is not removed again when the same hostname was added again since", async () => {
    const { cloudflare, deps, docId, old } = await registeredAgain("readded");

    expect(
      await removeDomain({ ...deps, ...old, row: { ...old.row, status: "removing" } }),
    ).toEqual({ ok: true });
    expect((await site(docId)).row).toMatchObject({ cloudflareId: "ch-2", status: "pending" });
    expect([...cloudflare.hostnames.keys()]).toEqual(["ch-2"]);
    expect(kv("host:docs.readded.com")).toEqual(["readded"]);
  });

  it("does not have its status written over the new registration by a stale sync", async () => {
    const { deps, docId, old } = await registeredAgain("resynced");

    expect(await refreshDomain({ ...deps, ...old })).toEqual({ ok: true, domain: null });
    expect((await site(docId)).row).toMatchObject({ cloudflareId: "ch-2", status: "pending" });
    expect(kv("host:docs.resynced.com")).toEqual(["resynced"]);
  });
});

describe("refreshDomains", () => {
  it("syncs every domain, finishes removals and goes on past one that fails", async () => {
    // Earlier tests' domains point at their own fake zones.
    await db.delete(hostnames);
    const cloudflare = new FakeCloudflareZone();
    const deps = { env: production, fetch: cloudflare.fetch };
    const docIds = [];
    for (const name of ["cron-a", "cron-b", "cron-c", "cron-d"]) {
      const { docId } = await createDoc(name);
      await addDomain({ ...deps, doc: (await site(docId)).doc, hostname: `docs.${name}.com` });
      docIds.push(docId);
    }
    const ids = [...cloudflare.hostnames.keys()];
    cloudflare.failNext("GET", `${HOSTNAMES}/${ids[0]}`, 500, "Internal error");
    for (const id of ids) cloudflare.activate(id);
    await db.update(hostnames).set({ status: "failed" }).where(eq(hostnames.docId, docIds[2]!));
    await db.update(hostnames).set({ status: "removing" }).where(eq(hostnames.docId, docIds[3]!));
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    await refreshDomains(deps);

    const statuses = await Promise.all(docIds.map(async (id) => (await site(id)).row?.status));
    expect(statuses).toEqual(["pending", "active", "active", undefined]);
    expect([...cloudflare.hostnames.keys()]).toEqual(["ch-1", "ch-2", "ch-3"]);
    expect(
      cloudflare.requests.filter(({ method }) => method === "GET").map(({ url }) => url),
    ).toEqual([`${HOSTNAMES}/ch-1`, `${HOSTNAMES}/ch-2`, `${HOSTNAMES}/ch-3`]);
    expect(errors.mock.calls.map(([message]) => message)).toEqual([
      "could not sync the custom domain docs.cron-a.com",
    ]);
    errors.mockRestore();
  });

  it("does nothing in development", async () => {
    const cloudflare = new FakeCloudflareZone();
    await refreshDomains({
      env: { ...env, ...development } as unknown as DomainsEnv,
      fetch: cloudflare.fetch,
    });
    expect(cloudflare.requests).toEqual([]);
  });
});

describe("without Cloudflare credentials in production", () => {
  const unconfigured = { ...production, CUSTOM_HOSTNAMES_API_TOKEN: "" } as DomainsEnv;
  const NOT_CONFIGURED = {
    ok: false,
    error: {
      code: "NOT_CONFIGURED",
      message: "Custom domains are not configured: CUSTOM_HOSTNAMES_API_TOKEN is not set",
    },
  };

  it("refuses to add, refresh or remove domains", async () => {
    const { docId } = await createDoc("unconfigured");
    const cloudflare = new FakeCloudflareZone();
    const { doc } = await site(docId);
    const row = {
      hostname: "docs.unconfigured.com",
      docId,
      cloudflareId: "ch-9",
      status: "pending" as const,
      createdAt: JAN_1,
    };
    const deps = { env: unconfigured, fetch: cloudflare.fetch };

    expect(await addDomain({ ...deps, doc, hostname: row.hostname })).toEqual(NOT_CONFIGURED);
    expect(await refreshDomain({ ...deps, doc, row })).toEqual(NOT_CONFIGURED);
    expect(await removeDomain({ ...deps, doc, row })).toEqual(NOT_CONFIGURED);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    await refreshDomains(deps);
    expect(errors.mock.calls).toEqual([
      [
        "custom domains not refreshed: Custom domains are not configured: CUSTOM_HOSTNAMES_API_TOKEN is not set",
      ],
    ]);
    errors.mockRestore();
    expect(cloudflare.requests).toEqual([]);
  });
});

describe("docUrl", () => {
  const productionUrls = { ENVIRONMENT: "production", DOCS_DOMAIN: "shiru.page" } as const;
  const developmentUrls = { ENVIRONMENT: "development", DOCS_DOMAIN: "docs.localhost" } as const;

  it("serves a doc at its active custom domain in production", () => {
    expect(docUrl("acme", null, productionUrls)).toBe("https://acme.shiru.page");
    expect(docUrl("acme", "docs.acme.com", productionUrls)).toBe("https://docs.acme.com");
  });

  it("serves every doc through the local dispatch Worker in development", () => {
    expect(docUrl("acme", null, developmentUrls)).toBe("http://acme.docs.localhost:3003");
    expect(docUrl("acme", "docs.acme.com", developmentUrls)).toBe(
      "http://acme.docs.localhost:3003",
    );
  });
});
