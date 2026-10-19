import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import type { Doc } from "../docs/doc";
import { retirePreviews } from "../index";
import { buildCommit } from "../docs/git";
import { DRAFT, LIVE } from "../docs/names";
import { previews } from "../schema/docs";
import { artifacts, db, docObjects, publishWorkflow } from "../test/bindings";
import { createClient } from "../test/client";

const JAN_1 = new Date("2026-01-01T00:00:00.000Z");
const NOW = JAN_1.getTime();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(JAN_1);
});
afterEach(() => vi.useRealTimers());

const text = (value: string) => new TextEncoder().encode(value);

async function docOwner(email: string, slug: string) {
  const client = createClient();
  await client.signUpVerified(email, "Ada");
  await client.createOrganization(`Org ${slug}`);
  const { body } = await client.rpc("docs/create", {
    slug,
    name: "Acme Docs",
    visibility: "public",
  });
  return { client, docId: (body.json as { id: string }).id };
}

/** Pushes a first commit to the doc's repo, as a developer with a repo token could. */
async function pushFirstCommit(repo: string, files: Record<string, Uint8Array>) {
  await artifacts.create(repo);
  const commit = await buildCommit({
    tree: [],
    changes: Object.entries(files).map(([path, content]) => ({ path, op: "put", content })),
    parent: null,
    author: { name: "Dev", email: "dev@example.com" },
    message: "import",
    time: 1760000000,
  });
  artifacts.receive(repo, commit.objects, commit.sha);
  return commit.sha;
}

const docNotFound = {
  status: 404,
  body: { json: { defined: true, code: "NOT_FOUND", status: 404, message: "Site not found" } },
};
const fileNotFound = {
  status: 404,
  body: { json: { defined: true, code: "FILE_NOT_FOUND", status: 404, message: "File not found" } },
};

describe("doc files", () => {
  it("hides another organization's doc behind NOT_FOUND", async () => {
    const { docId } = await docOwner("owner@mailinator.com", "owned");
    const stranger = createClient();
    await stranger.signUpVerified("stranger@mailinator.com");
    await stranger.createOrganization("Stranger");

    const path = "content/index.mdx";
    const calls = await Promise.all([
      stranger.rpc("docs/files/tree", { docId }),
      stranger.rpc("docs/files/get", { docId, path }),
      stranger.rpc("docs/files/save", { docId, path, content: "stolen" }),
      stranger.rpc("docs/files/delete", { docId, path }),
      stranger.rpc("docs/files/discard", { docId, path }),
      stranger.rpc("docs/publish", { docId }),
      stranger.rpc("docs/preview", { docId }),
      stranger.rpc("docs/status", { docId }),
    ]);
    expect(calls).toEqual(Array.from({ length: 8 }, () => docNotFound));
  });

  it("starts a new doc with a config and a home page to publish", async () => {
    const { client, docId } = await docOwner("starter@mailinator.com", "starter");

    expect(await client.rpc("docs/files/tree", { docId })).toEqual({
      status: 200,
      body: {
        json: {
          files: [
            { path: "content/index.mdx", status: "added", conflict: false },
            { path: "docs.config.json", status: "added", conflict: false },
          ],
        },
      },
    });
    expect(await client.rpc("docs/files/get", { docId, path: "docs.config.json" })).toEqual({
      status: 200,
      body: {
        json: {
          path: "docs.config.json",
          content: '{\n  "version": 1,\n  "name": "Acme Docs"\n}\n',
        },
      },
    });
    expect(await client.rpc("docs/status", { docId })).toEqual({
      status: 200,
      body: {
        json: {
          headSha: null,
          targets: {},
          runs: {},
          drafts: [
            {
              path: "content/index.mdx",
              op: "put",
              conflict: false,
              updatedAt: NOW,
              updatedBy: "shiru",
            },
            {
              path: "docs.config.json",
              op: "put",
              conflict: false,
              updatedAt: NOW,
              updatedBy: "shiru",
            },
          ],
        },
      },
    });
  });

  it("saves, reads back, deletes and discards drafts", async () => {
    const { client, docId } = await docOwner("drafts@mailinator.com", "drafts");
    const path = "content/guides/setup.mdx";

    expect(await client.rpc("docs/files/save", { docId, path, content: "# Setup\n" })).toEqual({
      status: 200,
      body: { json: { path, status: "added", conflict: false } },
    });
    expect(await client.rpc("docs/files/get", { docId, path })).toEqual({
      status: 200,
      body: { json: { path, content: "# Setup\n" } },
    });

    // A file that was never published has nothing to delete but its draft.
    expect(await client.rpc("docs/files/delete", { docId, path })).toEqual({
      status: 200,
      body: { json: { path, deleted: true } },
    });
    expect(await client.rpc("docs/files/get", { docId, path })).toEqual(fileNotFound);
    expect(await client.rpc("docs/files/delete", { docId, path })).toEqual(fileNotFound);

    expect(await client.rpc("docs/files/discard", { docId, path: "docs.config.json" })).toEqual({
      status: 200,
      body: { json: { path: "docs.config.json", discarded: true } },
    });
    expect(await client.rpc("docs/files/discard", { docId, path: "docs.config.json" })).toEqual(
      fileNotFound,
    );
  });

  it("reads a repo that already has commits and overlays edits on it", async () => {
    const { client, docId } = await docOwner("existing@mailinator.com", "existing");
    const head = await pushFirstCommit(docId, {
      "README.md": text("# Repo\n"),
      "docs/content/index.mdx": text("# Home\n"),
      "docs/content/old.mdx": text("# Old\n"),
      "docs/assets/logo.png": new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0xff]),
    });

    await client.rpc("docs/files/save", {
      docId,
      path: "content/index.mdx",
      content: "# Home, edited\n",
    });
    await client.rpc("docs/files/delete", { docId, path: "content/old.mdx" });

    expect(await client.rpc("docs/files/tree", { docId })).toEqual({
      status: 200,
      body: {
        json: {
          files: [
            { path: "assets/logo.png", status: "unchanged", conflict: false },
            { path: "content/index.mdx", status: "modified", conflict: false },
            { path: "content/old.mdx", status: "deleted", conflict: false },
          ],
        },
      },
    });
    expect(await client.rpc("docs/files/get", { docId, path: "content/old.mdx" })).toEqual(
      fileNotFound,
    );
    expect(await client.rpc("docs/files/get", { docId, path: "assets/logo.png" })).toEqual({
      status: 415,
      body: {
        json: { defined: true, code: "NOT_TEXT", status: 415, message: "This file is not text" },
      },
    });
    expect(await client.rpc("docs/files/discard", { docId, path: "content/index.mdx" })).toEqual({
      status: 200,
      body: { json: { path: "content/index.mdx", discarded: true } },
    });
    expect(await client.rpc("docs/files/get", { docId, path: "content/index.mdx" })).toEqual({
      status: 200,
      body: { json: { path: "content/index.mdx", content: "# Home\n" } },
    });
    expect(
      ((await client.rpc("docs/status", { docId })).body.json as { headSha: string }).headSha,
    ).toBe(head);
  });

  it("starts a build under a new id after the doc loses its stored state", async () => {
    const { client, docId } = await docOwner("rebuilt@mailinator.com", "rebuilt");
    const head = await pushFirstCommit(docId, { "docs/content/index.mdx": text("# Home\n") });
    const buildId = async () => {
      await client.rpc("docs/publish", { docId });
      const { body } = await client.rpc("docs/status", { docId });
      return (body.json as { targets: { live: { build: { workflowId: string } } } }).targets.live
        .build.workflowId;
    };

    const first = await buildId();
    docObjects.instances.delete(docId);
    const second = await buildId();

    expect(first).toMatch(new RegExp(`^${docId}--[0-9a-f]{8}--live--1$`));
    expect(second).toMatch(new RegExp(`^${docId}--[0-9a-f]{8}--live--1$`));
    expect(second).not.toBe(first);
    expect([...publishWorkflow.created.keys()].filter((id) => id.startsWith(docId))).toEqual([
      first,
      second,
    ]);
    expect(publishWorkflow.created.get(second)).toEqual({
      docId,
      slug: "rebuilt",
      repo: docId,
      target: "live",
      sha: head,
      docUrl: "http://rebuilt.docs.localhost:3003",
      docsRoot: "docs/",
    });
    expect(
      ((await client.rpc("docs/status", { docId })).body.json as { headSha: string }).headSha,
    ).toBe(head);
  });

  it("gives a build started in the background the slug of a doc stored without one", async () => {
    const { client, docId } = await docOwner("legacy@mailinator.com", "legacy");
    const head = await pushFirstCommit(docId, { "docs/content/index.mdx": text("# Home\n") });
    await client.rpc("docs/publish", { docId });
    const first = [...publishWorkflow.created.keys()].find((id) => id.startsWith(docId))!;
    const doc = docObjects.getByName(docId) as unknown as Pick<Doc, "build" | "buildFinished">;
    await doc.build(LIVE, "f".repeat(40));

    // A record from before the slug was stored, as a doc opened before this release kept it.
    const { ctx } = docObjects.instances.get(docId) as { ctx: { storage: { sql: SqlStorage } } };
    const [row] = ctx.storage.sql
      .exec<{ value: string }>("SELECT value FROM meta WHERE key = 'doc'")
      .toArray();
    const { slug: _, ...legacy } = JSON.parse(row!.value) as Record<string, unknown>;
    ctx.storage.sql.exec("UPDATE meta SET value = ? WHERE key = 'doc'", JSON.stringify(legacy));

    await doc.buildFinished(LIVE, first, { ok: true, templateVersion: "v1" });

    const started = [...publishWorkflow.created.entries()].filter(([id]) => id.startsWith(docId));
    expect(started.map(([, params]) => [params.sha, params.slug])).toEqual([
      [head, "legacy"],
      ["f".repeat(40), "legacy"],
    ]);
  });

  it("refuses a path that leaves the docs root", async () => {
    const { client, docId } = await docOwner("escape@mailinator.com", "escape");
    expect(
      await client.rpc("docs/files/save", { docId, path: "../README.md", content: "x" }),
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
                code: "custom",
                message: "../README.md has an empty, . or .. segment",
                path: ["path"],
              },
            ],
          },
        },
      },
    });
  });
});

describe("docs.preview", () => {
  const workflowsOf = (docId: string) =>
    [...publishWorkflow.created.entries()].filter(([id]) => id.startsWith(docId));
  const previewRows = (docId: string) =>
    db.select().from(previews).where(eq(previews.docId, docId));

  it("builds head on the draft target when there are no drafts, once per change", async () => {
    const { client, docId } = await docOwner("preview-head@mailinator.com", "preview-head");
    const head = await pushFirstCommit(docId, { "docs/content/index.mdx": text("# Home\n") });

    const previewing = {
      status: 200,
      body: {
        json: {
          kind: "previewing",
          sha: head,
          url: "http://draft--preview-head.preview.docs.localhost:3003",
        },
      },
    };
    expect(await client.rpc("docs/preview", { docId })).toEqual(previewing);
    vi.setSystemTime(NOW + 60_000);
    expect(await client.rpc("docs/preview", { docId })).toEqual(previewing);

    const started = workflowsOf(docId);
    expect(started.map(([id, params]) => [id.replace(/--[0-9a-f]{8}--/, "--"), params])).toEqual([
      [
        `${docId}--draft--1`,
        {
          docId,
          slug: "preview-head",
          repo: docId,
          target: "draft",
          sha: head,
          docUrl: "http://draft--preview-head.preview.docs.localhost:3003",
          docsRoot: "docs/",
        },
      ],
    ]);
    const { body } = await client.rpc("docs/status", { docId });
    expect((body.json as { targets: unknown }).targets).toEqual({
      draft: {
        kind: "building",
        build: { sha: head, workflowId: started[0]![0] },
        pendingSha: null,
        deployed: null,
      },
    });
    // The second click moved the cron's clock forward.
    expect(await previewRows(docId)).toEqual([
      { docId, label: "draft", requestedAt: new Date(NOW + 60_000) },
    ]);
  });

  it("has nothing to build without a commit or a draft", async () => {
    const { client, docId } = await docOwner("preview-empty@mailinator.com", "preview-empty");
    await client.rpc("docs/files/discard", { docId, path: "content/index.mdx" });
    await client.rpc("docs/files/discard", { docId, path: "docs.config.json" });

    expect(await client.rpc("docs/preview", { docId })).toEqual({
      status: 200,
      body: { json: { kind: "empty" } },
    });
    expect(workflowsOf(docId)).toEqual([]);
    expect(await previewRows(docId)).toEqual([]);
  });
});

describe("retiring stale previews", () => {
  const DAY = 24 * 60 * 60 * 1000;

  async function previewed(email: string, slug: string) {
    const { client, docId } = await docOwner(email, slug);
    await pushFirstCommit(docId, { "docs/content/index.mdx": text("# Home\n") });
    await client.rpc("docs/preview", { docId });
    return { client, docId };
  }

  async function finishDraftBuild(client: ReturnType<typeof createClient>, docId: string) {
    const { body } = await client.rpc("docs/status", { docId });
    const { workflowId } = (body.json as { targets: { draft: { build: { workflowId: string } } } })
      .targets.draft.build;
    const doc = docObjects.getByName(docId) as unknown as Pick<Doc, "buildFinished">;
    await doc.buildFinished(DRAFT, workflowId, { ok: true, templateVersion: "v1" });
  }

  // Read from the Doc: the members' sessions have expired by the time the cron runs.
  const targetsOf = async ({ docId }: { docId: string }) => {
    const doc = docObjects.getByName(docId) as unknown as DurableObjectStub<Doc>;
    const { targets, runs } = await doc.status();
    return { targets: Object.keys(targets), runs: Object.keys(runs) };
  };

  it("retires previews idle for 30 days, keeping fresh, building and failing ones", async () => {
    const stale = await previewed("retire-stale@mailinator.com", "retire-stale");
    await finishDraftBuild(stale.client, stale.docId);
    const building = await previewed("retire-busy@mailinator.com", "retire-busy");
    // Never opened in the editor, so its Doc cannot retire anything and throws.
    const broken = await docOwner("retire-broken@mailinator.com", "retire-broken");
    await db.insert(previews).values({ docId: broken.docId, label: DRAFT, requestedAt: JAN_1 });
    vi.setSystemTime(NOW + 20 * DAY);
    const fresh = await previewed("retire-fresh@mailinator.com", "retire-fresh");
    await finishDraftBuild(fresh.client, fresh.docId);

    const rows = async () =>
      (await db.select().from(previews))
        .filter(({ docId }) => [stale, building, broken, fresh].some((doc) => doc.docId === docId))
        .map(({ docId, requestedAt }) => [docId, requestedAt.getTime()]);

    await retirePreviews(NOW + 31 * DAY);
    const kept = [
      [building.docId, NOW],
      [broken.docId, NOW],
      [fresh.docId, NOW + 20 * DAY],
    ];
    expect(await rows()).toEqual(kept);
    expect(await targetsOf(stale)).toEqual({ targets: [], runs: [] });
    expect(await targetsOf(building)).toEqual({
      targets: ["draft"],
      runs: ["draft"],
    });
    expect(await targetsOf(fresh)).toEqual({
      targets: ["draft"],
      runs: ["draft"],
    });

    await retirePreviews(NOW + 31 * DAY);
    expect(await rows()).toEqual(kept);
  });

  it("keeps a preview requested again after the cron chose it", async () => {
    const { client, docId } = await previewed("retire-again@mailinator.com", "retire-again");
    await finishDraftBuild(client, docId);
    const cutoff = NOW + DAY;
    // The cron chose this preview, then a member previewed the unchanged drafts before the Doc
    // retired it: nothing rebuilds, only the request time moves.
    vi.setSystemTime(NOW + 2 * DAY);
    expect((await client.rpc("docs/preview", { docId })).status).toBe(200);

    const doc = docObjects.getByName(docId) as unknown as DurableObjectStub<Doc>;
    expect(await doc.retire(DRAFT, cutoff)).toEqual({ kind: "fresh" });
    expect((await doc.status()).targets).toEqual({
      draft: { kind: "idle", deployed: { sha: expect.any(String), templateVersion: "v1" } },
    });
    expect(
      (await db.select().from(previews))
        .filter((row) => row.docId === docId)
        .map((row) => row.requestedAt.getTime()),
    ).toEqual([NOW + 2 * DAY]);
  });
});
