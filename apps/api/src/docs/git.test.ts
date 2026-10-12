import { describe, expect, it } from "vite-plus/test";

import { artifacts } from "../test/bindings";
import {
  blobSha,
  buildCommit,
  hashObject,
  packfile,
  parseReportStatus,
  readCommitFiles,
  readCommitTree,
  receivePackRequest,
} from "./git";

// Expected SHAs come from the real git: `git hash-object`, `git mktree` and `git commit-tree` with
// GIT_AUTHOR_DATE and GIT_COMMITTER_DATE set to "1760000000 +0000".
const HELLO = "ce013625030ba8dba906f756967f9e9ca394464a";
const X = "587be6b4c3f93f93c489c0111bba5596147a26cb";
const SUB = "2614d0513949d5477c6dff0b594774e15d3c0b01";
const DOCS = "11271e9cca53d183ad8728c6e6f05b07984a7f8b";
const ROOT = "160827b43e1e662d648721563c088f298def6003";
const FIRST = "568254b18637007e8fb1791ddbe2d1c5d401a505";
const DOCS_AFTER_DELETE = "eed7c567b6825df3f882557455a874ce805ea56b";
const ROOT_AFTER_DELETE = "275315883672aa6fb598cf101968818bf3295a6e";
const SECOND = "8090acf4832da69e89be27408ea4ae2c4219d285";

const text = (value: string) => new TextEncoder().encode(value);
const ada = { name: "Ada", email: "ada@example.com" };
const executable = { path: "docs/b/c.mdx", sha: X, mode: "100755" };

function first() {
  return buildCommit({
    tree: [executable],
    changes: [
      { path: "docs/b.md", op: "put", content: text("hello\n") },
      { path: "docs/a.md", op: "put", content: text("hello\n") },
    ],
    parent: null,
    author: ada,
    message: "publish",
    time: 1760000000,
  });
}

describe("buildCommit", () => {
  it("hashes blobs like git hash-object", async () => {
    expect(await blobSha(text("hello\n"))).toBe(HELLO);
  });

  it("builds the commit git builds, sending only objects the parent lacks", async () => {
    const commit = await first();
    expect(commit.sha).toBe(FIRST);
    // The executable file and its unchanged directory are already on the server.
    expect(commit.objects.map(({ type, sha }) => [type, sha])).toEqual([
      ["blob", HELLO],
      ["tree", DOCS],
      ["tree", ROOT],
      ["commit", FIRST],
    ]);
    expect(commit.tree).toEqual([
      { path: "docs/a.md", sha: HELLO, mode: "100644" },
      { path: "docs/b.md", sha: HELLO, mode: "100644" },
      { path: "docs/b/c.mdx", sha: X, mode: "100755" },
    ]);
  });

  it("deletes a file and keeps the executable bit of the files it leaves alone", async () => {
    const commit = await buildCommit({
      tree: (await first()).tree,
      changes: [{ path: "docs/a.md", op: "delete" }],
      parent: FIRST,
      author: ada,
      message: "second",
      time: 1760000000,
    });
    expect(commit.sha).toBe(SECOND);
    expect(commit.objects.map(({ sha }) => sha)).toEqual([
      DOCS_AFTER_DELETE,
      ROOT_AFTER_DELETE,
      SECOND,
    ]);
  });
});

describe("packfile", () => {
  it("writes the header, one deflated entry per object and a sha1 trailer", async () => {
    const commit = await first();
    const pack = await packfile(commit.objects);
    expect(new TextDecoder().decode(pack.slice(0, 4))).toBe("PACK");
    expect(pack.slice(4, 12)).toEqual(new Uint8Array([0, 0, 0, 2, 0, 0, 0, 4]));
    // A blob (type 3) of 6 bytes fits the size in the first header byte.
    expect(pack[12]).toBe(0x36);
    const trailer = new Uint8Array(
      await crypto.subtle.digest("SHA-1", pack.slice(0, pack.length - 20)),
    );
    expect(pack.slice(-20)).toEqual(trailer);
  });

  it("continues the size in a second header byte past 15 bytes", async () => {
    const pack = await packfile([{ type: "blob", sha: HELLO, body: new Uint8Array(300) }]);
    // 300 = 0b1_0010_1100: low nibble 0xc with the continuation bit, then 300 >> 4 = 18.
    expect([pack[12], pack[13]]).toEqual([0xbc, 18]);
  });
});

describe("receivePackRequest", () => {
  it("sends the compare-and-swap command, a flush and the pack", () => {
    const body = receivePackRequest(null, FIRST, text("PACK"));
    expect(new TextDecoder().decode(body)).toBe(
      `0074${"0".repeat(40)} ${FIRST} refs/heads/main\0report-status\n0000PACK`,
    );
  });
});

describe("parseReportStatus", () => {
  it("reads a committed push", () => {
    expect(parseReportStatus("000eunpack ok\n0017ok refs/heads/main\n0000")).toEqual({
      kind: "ok",
    });
  });

  it("reads a branch that moved", () => {
    expect(parseReportStatus("000eunpack ok\n0021ng refs/heads/main stale ref\n0000")).toEqual({
      kind: "stale",
    });
  });

  it("reports any other rejection with the server's line", () => {
    expect(
      parseReportStatus("0014unpack bad pack\n0026ng refs/heads/main unpacker error\n0000"),
    ).toEqual({ kind: "failed", message: "ng refs/heads/main unpacker error" });
    expect(parseReportStatus("")).toEqual({ kind: "failed", message: "empty push response" });
  });
});

describe("readCommitFiles", () => {
  it("reads the files under docsRoot from a commit, with their modes and bytes", async () => {
    const repo = await artifacts.create("read-commit");
    const commit = await first();
    artifacts.receive("read-commit", [
      ...commit.objects,
      { type: "blob", sha: X, body: text("x\n") },
      await executableDir(),
    ]);
    const handle = await artifacts.get(repo.name);

    expect((await executableDir()).sha).toBe(SUB);
    expect(await readCommitTree(handle, FIRST, "docs/b")).toEqual([executable]);
    expect(await readCommitTree(handle, FIRST, "missing")).toEqual([]);
    const files = await readCommitFiles(handle, FIRST, "docs");
    expect(
      files
        .map(({ path, content }) => [path, new TextDecoder().decode(content)])
        .sort(([a = ""], [b = ""]) => a.localeCompare(b)),
    ).toEqual([
      ["docs/a.md", "hello\n"],
      ["docs/b.md", "hello\n"],
      ["docs/b/c.mdx", "x\n"],
    ]);
    await expect(readCommitFiles(handle, "f".repeat(40), "docs")).rejects.toThrow(
      `commit ${"f".repeat(40)} not found`,
    );
  });
});

// The directory holding only the executable c.mdx, as the server already has it.
async function executableDir() {
  const entry = text("100755 c.mdx\0");
  const raw = Uint8Array.from(X.match(/../g)!, (pair) => Number.parseInt(pair, 16));
  const body = new Uint8Array(entry.length + raw.length);
  body.set(entry);
  body.set(raw, entry.length);
  return hashObject("tree", body);
}
