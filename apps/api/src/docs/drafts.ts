import { z } from "zod";

import { sourcePathError } from "../builder/protocol";
import { blobSha, buildCommit, type Change, type TreeEntry } from "./git";

/**
 * A managed doc keeps its docs under `docs/` in its repo, so the repo root stays free for a README
 * or CI files once the doc moves to GitHub. Paths over the API are relative to it.
 */
export const DOCS_ROOT = "docs/";

/** A path relative to the docs root, such as `src/content/docs/guides/setup.mdx`. */
export const DocPath = z
  .string()
  .superRefine((path, context) => {
    const error = sourcePathError(path);
    if (error) context.addIssue({ code: "custom", message: error });
  })
  .brand<"DocPath">();
export type DocPath = z.infer<typeof DocPath>;

export const repoPath = (path: DocPath) => `${DOCS_ROOT}${path}`;

/** An unpublished edit of one file. `path` is from the repo root. */
export type Draft = {
  path: string;
  /** The blob the edit started from; null for a file the repo does not have. */
  baseBlobSha: string | null;
  /** The file changed upstream since the edit started. Publish skips it. */
  conflict: boolean;
  updatedAt: number;
  updatedBy: string;
} & ({ op: "put"; content: Uint8Array } | { op: "delete" });

export type Tree = Map<string, TreeEntry>;

export const toTree = (entries: TreeEntry[]): Tree =>
  new Map(entries.map((entry) => [entry.path, entry]));

export type FileStatus = {
  path: string;
  status: "unchanged" | "added" | "modified" | "deleted";
  conflict: boolean;
};

/** Every file under the docs root as the editor sees it: the tree at head with drafts on top. */
export function overlay(tree: Tree, drafts: Draft[]): FileStatus[] {
  const files = new Map<string, FileStatus>();
  for (const path of tree.keys()) {
    if (path.startsWith(DOCS_ROOT)) files.set(path, { path, status: "unchanged", conflict: false });
  }
  for (const draft of drafts) {
    const status = draft.op === "delete" ? "deleted" : tree.has(draft.path) ? "modified" : "added";
    files.set(draft.path, { path: draft.path, status, conflict: draft.conflict });
  }
  return [...files.values()]
    .map((file) => ({ ...file, path: file.path.slice(DOCS_ROOT.length) }))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

/** Records new content for a file. The first edit pins the blob it started from. */
export function putDraft(
  previous: Draft | undefined,
  tree: Tree,
  path: string,
  content: Uint8Array,
  user: string,
  now: number,
): Draft {
  return {
    path,
    op: "put",
    content,
    baseBlobSha: previous ? previous.baseBlobSha : (tree.get(path)?.sha ?? null),
    conflict: previous?.conflict ?? false,
    updatedAt: now,
    updatedBy: user,
  };
}

export type DeleteOutcome =
  | { kind: "draft"; draft: Draft }
  // A file that only ever existed as a draft just loses the draft.
  | { kind: "discard" }
  | { kind: "not_found" };

export function deleteDraft(
  previous: Draft | undefined,
  tree: Tree,
  path: string,
  user: string,
  now: number,
): DeleteOutcome {
  const base = previous ? previous.baseBlobSha : (tree.get(path)?.sha ?? null);
  if (base === null && !tree.has(path))
    return previous ? { kind: "discard" } : { kind: "not_found" };
  if (previous?.op === "delete") return { kind: "not_found" };
  return {
    kind: "draft",
    draft: {
      path,
      op: "delete",
      baseBlobSha: base,
      conflict: previous?.conflict ?? false,
      updatedAt: now,
      updatedBy: user,
    },
  };
}

/** The changes publish commits: every draft that is not in conflict. */
export function committable(drafts: Draft[]): Change[] {
  return drafts.filter((draft) => !draft.conflict).map(toChange);
}

export function toChange(draft: Draft): Change {
  return draft.op === "put"
    ? { path: draft.path, op: "put", content: draft.content }
    : { path: draft.path, op: "delete" };
}

/**
 * The preview branch's commit of every draft on top of `head`. It depends only on head and the
 * drafts' contents and times, not on who asked, so previewing unchanged drafts gives the same sha
 * and builds nothing.
 */
export function previewCommit(tree: TreeEntry[], drafts: Draft[], head: string | null) {
  return buildCommit({
    tree,
    changes: drafts.map(toChange),
    parent: head,
    author: { name: "shiru", email: "preview@shiru.sh" },
    message: "Preview from the editor",
    time: Math.floor(Math.max(...drafts.map((draft) => draft.updatedAt)) / 1000),
  });
}

export type DraftUpdate = { clear: string[]; save: Draft[] };

/**
 * After head moved to `tree` by someone else's commit. A draft the new tree already matches is
 * done; any other draft conflicts exactly when its file no longer has the blob it started from.
 */
export async function reconcileDrafts(drafts: Draft[], tree: Tree): Promise<DraftUpdate> {
  const update: DraftUpdate = { clear: [], save: [] };
  for (const draft of drafts) {
    const current = tree.get(draft.path)?.sha ?? null;
    const target = draft.op === "put" ? await blobSha(draft.content) : null;
    if (current === target) {
      update.clear.push(draft.path);
      continue;
    }
    const conflict = current !== draft.baseBlobSha;
    if (conflict !== draft.conflict) update.save.push({ ...draft, conflict });
  }
  return update;
}

/**
 * After our own commit to `tree`. A committed draft nobody touched since publish collected it is
 * cleared; one edited meanwhile stays, now based on the blob just committed.
 */
export function afterCommit(collected: Draft[], current: Draft[], tree: Tree): DraftUpdate {
  const now = new Map(current.map((draft) => [draft.path, draft]));
  const update: DraftUpdate = { clear: [], save: [] };
  for (const draft of collected) {
    if (draft.conflict) continue;
    const latest = now.get(draft.path);
    if (!latest) continue;
    if (latest.updatedAt === draft.updatedAt) update.clear.push(draft.path);
    else update.save.push({ ...latest, baseBlobSha: tree.get(draft.path)?.sha ?? null });
  }
  return update;
}
