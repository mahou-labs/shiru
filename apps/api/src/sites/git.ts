/**
 * Git objects and the smart-HTTP push, written by hand because Artifacts' binding can read a repo
 * but not write it, and a Worker has no git binary. A commit is one `POST <remote>/git-receive-pack`
 * carrying only the objects the server does not have yet.
 */

/** One file of a commit's tree, at its path from the repository root. */
export type TreeEntry = { path: string; sha: string; mode: string };

export type Change =
  | { path: string; op: "put"; content: Uint8Array }
  | { path: string; op: "delete" };

export type GitObject = { type: "blob" | "tree" | "commit"; sha: string; body: Uint8Array };

export type Person = { name: string; email: string };

export const ZERO_SHA = "0".repeat(40);
export const FILE_MODE = "100644";
const TREE_MODE = "40000";
const BRANCH = "refs/heads/main";

const encoder = new TextEncoder();

export async function hashObject(type: GitObject["type"], body: Uint8Array): Promise<GitObject> {
  const raw = concat([encoder.encode(`${type} ${body.length}\0`), body]);
  return { type, sha: hex(await sha1(raw)), body };
}

export const blobSha = async (content: Uint8Array) => (await hashObject("blob", content)).sha;

export type BuiltCommit = { sha: string; tree: TreeEntry[]; objects: GitObject[] };

/**
 * Applies `changes` to the flat `tree` and builds the commit. `objects` holds only what the parent
 * commit lacks: the new blobs, the trees whose content changed and the commit itself.
 */
export async function buildCommit(input: {
  tree: TreeEntry[];
  changes: Change[];
  parent: string | null;
  author: Person;
  message: string;
  time: number;
}): Promise<BuiltCommit> {
  const files = new Map(input.tree.map((entry) => [entry.path, entry]));
  const blobs: GitObject[] = [];
  for (const change of input.changes) {
    if (change.op === "delete") {
      files.delete(change.path);
      continue;
    }
    const blob = await hashObject("blob", change.content);
    blobs.push(blob);
    files.set(change.path, {
      path: change.path,
      sha: blob.sha,
      mode: files.get(change.path)?.mode ?? FILE_MODE,
    });
  }
  const tree = [...files.values()].sort((a, b) => compareBytes(a.path, b.path));

  const oldTrees: GitObject[] = [];
  await buildTree(input.tree, oldTrees);
  const known = new Set([...oldTrees, ...input.tree].map((object) => object.sha));
  const newTrees: GitObject[] = [];
  const root = await buildTree(tree, newTrees);

  const person = `${identity(input.author)} ${Math.floor(input.time)} +0000`;
  const commit = await hashObject(
    "commit",
    encoder.encode(
      [
        `tree ${root}`,
        ...(input.parent ? [`parent ${input.parent}`] : []),
        `author ${person}`,
        `committer ${person}`,
        "",
        `${input.message.trimEnd()}\n`,
      ].join("\n"),
    ),
  );

  const objects = new Map<string, GitObject>();
  for (const object of [...blobs, ...newTrees, commit]) {
    if (!known.has(object.sha)) objects.set(object.sha, object);
  }
  return { sha: commit.sha, tree, objects: [...objects.values()] };
}

// Writes every tree object for `files` into `out` and returns the root tree's sha.
async function buildTree(files: TreeEntry[], out: GitObject[]): Promise<string> {
  const direct: { name: string; mode: string; sha: string }[] = [];
  const dirs = new Map<string, TreeEntry[]>();
  for (const file of files) {
    const slash = file.path.indexOf("/");
    if (slash < 0) {
      direct.push({ name: file.path, mode: file.mode, sha: file.sha });
      continue;
    }
    const dir = file.path.slice(0, slash);
    dirs.set(dir, [...(dirs.get(dir) ?? []), { ...file, path: file.path.slice(slash + 1) }]);
  }
  for (const [name, children] of dirs) {
    direct.push({ name, mode: TREE_MODE, sha: await buildTree(children, out) });
  }
  // Git orders a directory as if its name ended in "/".
  const key = (entry: { name: string; mode: string }) =>
    entry.mode === TREE_MODE ? `${entry.name}/` : entry.name;
  direct.sort((a, b) => compareBytes(key(a), key(b)));

  const tree = await hashObject(
    "tree",
    concat(
      direct.flatMap((entry) => [
        encoder.encode(`${entry.mode} ${entry.name}\0`),
        bytes(entry.sha),
      ]),
    ),
  );
  out.push(tree);
  return tree.sha;
}

/** A version 2 packfile holding `objects`, undeltified. */
export async function packfile(objects: GitObject[]): Promise<Uint8Array> {
  const header = new Uint8Array(12);
  header.set(encoder.encode("PACK"));
  const view = new DataView(header.buffer);
  view.setUint32(4, 2);
  view.setUint32(8, objects.length);

  const parts = [header];
  const types = { commit: 1, tree: 2, blob: 3 };
  for (const object of objects) {
    parts.push(objectHeader(types[object.type], object.body.length), await deflate(object.body));
  }
  const body = concat(parts);
  return concat([body, await sha1(body)]);
}

function objectHeader(type: number, size: number) {
  const out = [(type << 4) | (size & 0x0f)];
  let rest = size >>> 4;
  while (rest > 0) {
    out[out.length - 1]! |= 0x80;
    out.push(rest & 0x7f);
    rest >>>= 7;
  }
  return new Uint8Array(out);
}

/**
 * The receive-pack request that moves main from `oldSha` to `newSha`. The server applies it only
 * while main is still at `oldSha`, which makes it a compare-and-swap. `null` creates the branch.
 */
export function receivePackRequest(oldSha: string | null, newSha: string, pack: Uint8Array) {
  const command = `${oldSha ?? ZERO_SHA} ${newSha} ${BRANCH}\0report-status\n`;
  return concat([pktLine(command), encoder.encode("0000"), pack]);
}

function pktLine(line: string) {
  const payload = encoder.encode(line);
  return concat([encoder.encode((payload.length + 4).toString(16).padStart(4, "0")), payload]);
}

export type PushResult = { kind: "ok" } | { kind: "stale" } | { kind: "failed"; message: string };

/** Reads the report-status response of a receive-pack request. */
export function parseReportStatus(response: string): PushResult {
  const lines: string[] = [];
  let at = 0;
  while (at + 4 <= response.length) {
    const length = Number.parseInt(response.slice(at, at + 4), 16);
    if (!Number.isFinite(length)) break;
    if (length > 4) lines.push(response.slice(at + 4, at + length).replace(/\n$/, ""));
    at += Math.max(length, 4);
  }
  if (lines.includes("unpack ok") && lines.includes(`ok ${BRANCH}`)) return { kind: "ok" };
  const rejected = lines.find((line) => line.startsWith(`ng ${BRANCH} `));
  if (rejected?.endsWith(" stale ref")) return { kind: "stale" };
  return { kind: "failed", message: rejected ?? (lines.join("; ") || "empty push response") };
}

/** The part of the Artifacts repo binding that reads commits. */
export type RepoReader = Pick<ArtifactsRepo, "readCommit" | "readTree" | "readBlob">;

/** Every file under `docsRoot` at commit `sha`, with its bytes, at its path from the repository root. */
export async function readCommitFiles(repo: RepoReader, sha: string, docsRoot: string) {
  const entries = await readCommitTree(repo, sha, docsRoot);
  return Promise.all(
    entries.map(async ({ path, sha: blob }) => ({ path, content: await readBlob(repo, blob) })),
  );
}

/** The flat tree at commit `sha`, limited to `root` ("" for the whole repository). */
export async function readCommitTree(
  repo: RepoReader,
  sha: string,
  root = "",
): Promise<TreeEntry[]> {
  const commit = await repo.readCommit(sha);
  if (!commit) throw new Error(`commit ${sha} not found`);
  let tree: string | undefined = commit.treeHash;
  let prefix = "";
  // Walk down to the root directory one level at a time; a missing directory has no files.
  for (const name of root.split("/").filter(Boolean)) {
    const entries = await readTree(repo, tree);
    tree = entries.find((entry) => entry.name === name && entry.type === "tree")?.hash;
    if (!tree) return [];
    prefix += `${name}/`;
  }
  return walk(repo, tree, prefix);
}

async function walk(repo: RepoReader, tree: string, prefix: string): Promise<TreeEntry[]> {
  const entries = await readTree(repo, tree);
  const levels = await Promise.all(
    entries.map(async (entry) => {
      const path = `${prefix}${entry.name}`;
      if (entry.type === "tree") return walk(repo, entry.hash, `${path}/`);
      // Submodules have no bytes in this repo; a docs site never needs one.
      if (entry.type === "gitlink") return [];
      return [{ path, sha: entry.hash, mode: entry.mode }];
    }),
  );
  return levels.flat();
}

async function readTree(repo: RepoReader, sha: string) {
  const entries = await repo.readTree(sha);
  if (!entries) throw new Error(`tree ${sha} not found`);
  return entries;
}

export async function readBlob(repo: RepoReader, sha: string) {
  const blob = await repo.readBlob(sha);
  if (!blob) throw new Error(`blob ${sha} not found`);
  return new Uint8Array(await blob.arrayBuffer());
}

function identity({ name, email }: Person) {
  const clean = (value: string) => value.replace(/[<>\n\0]/g, "").trim();
  return `${clean(name) || "Shiru"} <${clean(email)}>`;
}

function compareBytes(a: string, b: string) {
  const x = encoder.encode(a);
  const y = encoder.encode(b);
  for (let i = 0; i < Math.min(x.length, y.length); i++) {
    if (x[i] !== y[i]) return x[i]! - y[i]!;
  }
  return x.length - y.length;
}

async function sha1(data: Uint8Array) {
  return new Uint8Array(await crypto.subtle.digest("SHA-1", data));
}

async function deflate(data: Uint8Array) {
  const stream = new Blob([data]).stream().pipeThrough(new CompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function hex(data: Uint8Array) {
  return [...data].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function bytes(sha: string) {
  return Uint8Array.from(sha.match(/../g)!, (pair) => Number.parseInt(pair, 16));
}

function concat(parts: Uint8Array[]) {
  const out = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}
