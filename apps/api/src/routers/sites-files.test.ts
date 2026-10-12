import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { buildCommit } from "../sites/git";
import { artifacts, env } from "../test/bindings";
import { createClient } from "../test/client";
import { siteUrl } from "./sites";

const JAN_1 = new Date("2026-01-01T00:00:00.000Z");
const NOW = JAN_1.getTime();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(JAN_1);
});
afterEach(() => vi.useRealTimers());

const text = (value: string) => new TextEncoder().encode(value);

async function siteOwner(email: string, slug: string) {
  const client = createClient();
  await client.signUpVerified(email, "Ada");
  await client.createOrganization(`Org ${slug}`);
  const { body } = await client.rpc("sites/create", {
    slug,
    name: "Acme Docs",
    visibility: "public",
  });
  return { client, siteId: (body.json as { id: string }).id };
}

/** Pushes a first commit to the site's repo, as a developer with a repo token could. */
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

const siteNotFound = {
  status: 404,
  body: { json: { defined: true, code: "NOT_FOUND", status: 404, message: "Site not found" } },
};
const fileNotFound = {
  status: 404,
  body: { json: { defined: true, code: "FILE_NOT_FOUND", status: 404, message: "File not found" } },
};

describe("site files", () => {
  it("hides another organization's site behind NOT_FOUND", async () => {
    const { siteId } = await siteOwner("owner@mailinator.com", "owned");
    const stranger = createClient();
    await stranger.signUpVerified("stranger@mailinator.com");
    await stranger.createOrganization("Stranger");

    const path = "content/index.mdx";
    const calls = await Promise.all([
      stranger.rpc("sites/files/tree", { siteId }),
      stranger.rpc("sites/files/get", { siteId, path }),
      stranger.rpc("sites/files/save", { siteId, path, content: "stolen" }),
      stranger.rpc("sites/files/delete", { siteId, path }),
      stranger.rpc("sites/files/discard", { siteId, path }),
      stranger.rpc("sites/publish", { siteId }),
      stranger.rpc("sites/status", { siteId }),
    ]);
    expect(calls).toEqual(Array.from({ length: 7 }, () => siteNotFound));
  });

  it("starts a new site with a config and a home page to publish", async () => {
    const { client, siteId } = await siteOwner("starter@mailinator.com", "starter");

    expect(await client.rpc("sites/files/tree", { siteId })).toEqual({
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
    expect(await client.rpc("sites/files/get", { siteId, path: "docs.config.json" })).toEqual({
      status: 200,
      body: {
        json: {
          path: "docs.config.json",
          content: '{\n  "version": 1,\n  "name": "Acme Docs"\n}\n',
        },
      },
    });
    expect(await client.rpc("sites/status", { siteId })).toEqual({
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
    const { client, siteId } = await siteOwner("drafts@mailinator.com", "drafts");
    const path = "content/guides/setup.mdx";

    expect(await client.rpc("sites/files/save", { siteId, path, content: "# Setup\n" })).toEqual({
      status: 200,
      body: { json: { path, status: "added", conflict: false } },
    });
    expect(await client.rpc("sites/files/get", { siteId, path })).toEqual({
      status: 200,
      body: { json: { path, content: "# Setup\n" } },
    });

    // A file that was never published has nothing to delete but its draft.
    expect(await client.rpc("sites/files/delete", { siteId, path })).toEqual({
      status: 200,
      body: { json: { path, deleted: true } },
    });
    expect(await client.rpc("sites/files/get", { siteId, path })).toEqual(fileNotFound);
    expect(await client.rpc("sites/files/delete", { siteId, path })).toEqual(fileNotFound);

    expect(await client.rpc("sites/files/discard", { siteId, path: "docs.config.json" })).toEqual({
      status: 200,
      body: { json: { path: "docs.config.json", discarded: true } },
    });
    expect(await client.rpc("sites/files/discard", { siteId, path: "docs.config.json" })).toEqual(
      fileNotFound,
    );
  });

  it("reads a repo that already has commits and overlays edits on it", async () => {
    const { client, siteId } = await siteOwner("existing@mailinator.com", "existing");
    const head = await pushFirstCommit(siteId, {
      "README.md": text("# Repo\n"),
      "docs/content/index.mdx": text("# Home\n"),
      "docs/content/old.mdx": text("# Old\n"),
      "docs/assets/logo.png": new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0xff]),
    });

    await client.rpc("sites/files/save", {
      siteId,
      path: "content/index.mdx",
      content: "# Home, edited\n",
    });
    await client.rpc("sites/files/delete", { siteId, path: "content/old.mdx" });

    expect(await client.rpc("sites/files/tree", { siteId })).toEqual({
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
    expect(await client.rpc("sites/files/get", { siteId, path: "content/old.mdx" })).toEqual(
      fileNotFound,
    );
    expect(await client.rpc("sites/files/get", { siteId, path: "assets/logo.png" })).toEqual({
      status: 415,
      body: {
        json: { defined: true, code: "NOT_TEXT", status: 415, message: "This file is not text" },
      },
    });
    expect(await client.rpc("sites/files/discard", { siteId, path: "content/index.mdx" })).toEqual({
      status: 200,
      body: { json: { path: "content/index.mdx", discarded: true } },
    });
    expect(await client.rpc("sites/files/get", { siteId, path: "content/index.mdx" })).toEqual({
      status: 200,
      body: { json: { path: "content/index.mdx", content: "# Home\n" } },
    });
    expect(
      ((await client.rpc("sites/status", { siteId })).body.json as { headSha: string }).headSha,
    ).toBe(head);
  });

  it("refuses a path that leaves the docs root", async () => {
    const { client, siteId } = await siteOwner("escape@mailinator.com", "escape");
    expect(
      await client.rpc("sites/files/save", { siteId, path: "../README.md", content: "x" }),
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

describe("siteUrl", () => {
  afterEach(() => {
    env.ENVIRONMENT = "development";
  });

  it("serves sites through the local dispatch Worker in development, over https otherwise", () => {
    expect(siteUrl("acme")).toBe("http://acme.docs.localhost:3003");
    env.ENVIRONMENT = "production";
    expect(siteUrl("acme")).toBe("https://acme.docs.localhost");
  });
});
