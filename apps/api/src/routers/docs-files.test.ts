import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { buildCommit } from "../docs/git";
import { artifacts, docObjects, env, publishWorkflow } from "../test/bindings";
import { createClient } from "../test/client";
import { docUrl } from "./docs";

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
      stranger.rpc("docs/status", { docId }),
    ]);
    expect(calls).toEqual(Array.from({ length: 7 }, () => docNotFound));
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
    expect(publishWorkflow.created.filter((id) => id.startsWith(docId))).toEqual([first, second]);
    expect(
      ((await client.rpc("docs/status", { docId })).body.json as { headSha: string }).headSha,
    ).toBe(head);
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

describe("docUrl", () => {
  afterEach(() => {
    env.ENVIRONMENT = "development";
  });

  it("serves docs through the local dispatch Worker in development, over https otherwise", () => {
    expect(docUrl("acme")).toBe("http://acme.docs.localhost:3003");
    env.ENVIRONMENT = "production";
    expect(docUrl("acme")).toBe("https://acme.docs.localhost");
  });
});
