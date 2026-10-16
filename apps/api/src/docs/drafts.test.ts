import { describe, expect, it } from "vite-plus/test";

import {
  afterCommit,
  committable,
  deleteDraft,
  type Draft,
  overlay,
  previewCommit,
  putDraft,
  reconcileDrafts,
  DocPath,
  starterDrafts,
  toTree,
} from "./drafts";

const text = (value: string) => new TextEncoder().encode(value);
// `git hash-object` of "hello\n" and "x\n".
const HELLO = "ce013625030ba8dba906f756967f9e9ca394464a";
const X = "587be6b4c3f93f93c489c0111bba5596147a26cb";

const tree = toTree([
  { path: "README.md", sha: X, mode: "100644" },
  { path: "docs/content/index.mdx", sha: HELLO, mode: "100644" },
  { path: "docs/content/old.mdx", sha: X, mode: "100644" },
]);

function put(path: string, content: string, base: string | null, updatedAt = 1): Draft {
  return {
    path,
    op: "put",
    content: text(content),
    baseBlobSha: base,
    conflict: false,
    updatedAt,
    updatedBy: "ada",
  };
}

describe("DocPath", () => {
  it("accepts a relative path and refuses one that escapes the docs root", () => {
    expect(DocPath.safeParse("content/index.mdx").success).toBe(true);
    expect(DocPath.safeParse("../secrets").error?.issues[0]?.message).toBe(
      "../secrets has an empty, . or .. segment",
    );
    expect(DocPath.safeParse("/etc/passwd").error?.issues[0]?.message).toBe(
      "/etc/passwd must be relative",
    );
  });
});

describe("overlay", () => {
  it("lists files under the docs root with each draft's effect", () => {
    const drafts: Draft[] = [
      put("docs/content/index.mdx", "changed\n", HELLO),
      put("docs/content/new.mdx", "new\n", null),
      { ...put("docs/content/old.mdx", "", X), op: "delete", conflict: true },
    ];
    expect(overlay(tree, drafts)).toEqual([
      { path: "content/index.mdx", status: "modified", conflict: false },
      { path: "content/new.mdx", status: "added", conflict: false },
      { path: "content/old.mdx", status: "deleted", conflict: true },
    ]);
  });
});

describe("putDraft", () => {
  it("pins the blob the first edit started from and keeps it on later edits", () => {
    const first = putDraft(undefined, tree, "docs/content/index.mdx", text("a"), "ada", 5);
    expect(first.baseBlobSha).toBe(HELLO);
    const moved = toTree([{ path: "docs/content/index.mdx", sha: X, mode: "100644" }]);
    const second = putDraft(first, moved, "docs/content/index.mdx", text("b"), "bob", 6);
    expect([second.baseBlobSha, second.updatedBy, second.updatedAt]).toEqual([HELLO, "bob", 6]);
  });
});

describe("deleteDraft", () => {
  it("records a delete for a file at head", () => {
    expect(deleteDraft(undefined, tree, "docs/content/old.mdx", "ada", 7)).toEqual({
      kind: "draft",
      draft: {
        path: "docs/content/old.mdx",
        op: "delete",
        baseBlobSha: X,
        conflict: false,
        updatedAt: 7,
        updatedBy: "ada",
      },
    });
  });

  it("drops the draft of a file that was never published, and refuses a missing file", () => {
    const added = put("docs/content/new.mdx", "new\n", null);
    expect(deleteDraft(added, tree, added.path, "ada", 7)).toEqual({ kind: "discard" });
    expect(deleteDraft(undefined, tree, "docs/nothing.mdx", "ada", 7)).toEqual({
      kind: "not_found",
    });
    const deleted = deleteDraft(undefined, tree, "docs/content/old.mdx", "ada", 7);
    if (deleted.kind !== "draft") throw new Error("expected a draft");
    expect(deleteDraft(deleted.draft, tree, "docs/content/old.mdx", "ada", 8)).toEqual({
      kind: "not_found",
    });
  });
});

describe("committable", () => {
  it("turns drafts into changes and skips conflicts", () => {
    const drafts: Draft[] = [
      put("docs/a.mdx", "a", null),
      { ...put("docs/b.mdx", "b", X), conflict: true },
      { ...put("docs/c.mdx", "", X), op: "delete" },
    ];
    expect(committable(drafts)).toEqual([
      { path: "docs/a.mdx", op: "put", content: text("a") },
      { path: "docs/c.mdx", op: "delete" },
    ]);
  });
});

describe("reconcileDrafts", () => {
  it("flags drafts whose file moved, clears drafts head already matches", async () => {
    const drafts: Draft[] = [
      put("docs/content/index.mdx", "mine\n", X),
      put("docs/content/old.mdx", "mine\n", X),
      put("docs/content/same.mdx", "hello\n", null),
      { ...put("docs/gone.mdx", "", X), op: "delete" },
    ];
    const head = toTree([
      { path: "docs/content/index.mdx", sha: HELLO, mode: "100644" },
      { path: "docs/content/old.mdx", sha: X, mode: "100644" },
      { path: "docs/content/same.mdx", sha: HELLO, mode: "100644" },
    ]);
    expect(await reconcileDrafts(drafts, head)).toEqual({
      clear: ["docs/content/same.mdx", "docs/gone.mdx"],
      save: [{ ...drafts[0], conflict: true }],
    });
  });

  it("lifts a conflict once head is back at the draft's base", async () => {
    const draft = { ...put("docs/content/index.mdx", "mine\n", HELLO), conflict: true };
    expect(await reconcileDrafts([draft], tree)).toEqual({
      clear: [],
      save: [{ ...draft, conflict: false }],
    });
  });
});

describe("afterCommit", () => {
  it("clears what was committed and rebases what was edited during the commit", () => {
    const collected: Draft[] = [
      put("docs/a.mdx", "a", null, 1),
      put("docs/b.mdx", "b", null, 1),
      { ...put("docs/c.mdx", "c", X, 1), conflict: true },
    ];
    const current: Draft[] = [collected[0]!, put("docs/b.mdx", "b2", null, 2), collected[2]!];
    const head = toTree([
      { path: "docs/a.mdx", sha: HELLO, mode: "100644" },
      { path: "docs/b.mdx", sha: X, mode: "100644" },
    ]);
    expect(afterCommit(collected, current, head)).toEqual({
      clear: ["docs/a.mdx"],
      save: [{ ...current[1], baseBlobSha: X }],
    });
  });
});

describe("starterDrafts", () => {
  it("writes a config and a home page named after the doc", () => {
    const decoded = starterDrafts('Acme {docs} <"beta">', "ada", 3).map((draft) => [
      draft.path,
      draft.op === "put" ? new TextDecoder().decode(draft.content) : null,
    ]);
    expect(decoded).toEqual([
      ["docs/docs.config.json", '{\n  "version": 1,\n  "name": "Acme {docs} <\\"beta\\">"\n}\n'],
      [
        "docs/content/index.mdx",
        '---\ntitle: "Acme {docs} <\\"beta\\">"\n---\n\nStart writing here.\n',
      ],
    ]);
  });
});

describe("previewCommit", () => {
  const HEAD = "1111111111111111111111111111111111111111";
  const edit = (updatedBy: string, content = "Only in the preview.\n") => ({
    ...put("docs/content/index.mdx", content, HELLO, 1_792_000_000_123),
    updatedBy,
  });

  it("gives two members previewing the same drafts the same commit", async () => {
    const ada = await previewCommit([...tree.values()], [edit("ada@example.com")], HEAD);
    const grace = await previewCommit([...tree.values()], [edit("grace@example.com")], HEAD);

    expect(grace.sha).toBe(ada.sha);
    const commit = new TextDecoder().decode(ada.objects.find((o) => o.type === "commit")!.body);
    expect(commit.split("\n").slice(1, 4)).toEqual([
      `parent ${HEAD}`,
      "author shiru <preview@shiru.sh> 1792000000 +0000",
      "committer shiru <preview@shiru.sh> 1792000000 +0000",
    ]);
  });

  it("gives other drafts or another head another commit", async () => {
    const base = await previewCommit([...tree.values()], [edit("ada")], HEAD);
    const edited = await previewCommit([...tree.values()], [edit("ada", "Changed.\n")], HEAD);
    const moved = await previewCommit([...tree.values()], [edit("ada")], "2".repeat(40));

    expect(new Set([base.sha, edited.sha, moved.sha]).size).toBe(3);
  });
});
