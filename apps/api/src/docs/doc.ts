import { DurableObject } from "cloudflare:workers";
import { and, eq, lte } from "drizzle-orm";

import { deleteBuild } from "../deploy/deploy";
import { servedAt } from "../domains/domains";
import { previews } from "../schema/docs";
import { db } from "../utils/db";
import {
  applyBuildEvent,
  type BuildEvent,
  type BuildResult,
  initialBuilds,
  type InstanceStatus,
  isCurrentBuild,
  lookupFailure,
  parseInstanceStatus,
  type DocBuilds,
} from "./build-state";
import {
  afterCommit,
  committable,
  deleteDraft,
  DOCS_ROOT,
  type Draft,
  type DraftUpdate,
  type FileStatus,
  overlay,
  putDraft,
  reconcileDrafts,
  repoPath,
  DocPath,
  starterDrafts,
  previewCommit,
  type Tree,
  toTree,
} from "./drafts";
import {
  buildCommit,
  type BuiltCommit,
  MAIN,
  packfile,
  PREVIEW,
  parseReportStatus,
  type Person,
  type PushResult,
  readBlob,
  readCommitTree,
  receivePackRequest,
  type Ref,
} from "./git";
import { type DocSlug, DRAFT, LIVE, type TargetLabel, workerName } from "./names";
import type { PublishParams } from "./publish-workflow";
import { previewUrl } from "./urls";
import { type BuildStep, endRun, enterStep, type Run, startRun } from "./runs";

export type DocInfo = { docId: string; slug: DocSlug; name: string; repo: string };

export type PublishResult =
  | { kind: "published"; sha: string; skipped: string[] }
  | { kind: "unchanged"; sha: string | null; skipped: string[] }
  // The branch moved under every attempt.
  | { kind: "conflict" };

export type PreviewResult =
  | { kind: "previewing"; sha: string; url: string }
  // No commit and no drafts: there is nothing to build.
  | { kind: "empty" }
  // The preview branch moved under every attempt.
  | { kind: "conflict" };

export type DocStatus = {
  headSha: string | null;
  targets: DocBuilds["targets"];
  runs: Runs;
  drafts: {
    path: string;
    op: Draft["op"];
    conflict: boolean;
    updatedAt: number;
    updatedBy: string;
  }[];
};

type Runs = Partial<Record<TargetLabel, Run>>;

const ALARM_DELAY_MS = 15 * 60 * 1000;
const PUBLISH_ATTEMPTS = 3;
const TOKEN_TTL_SECONDS = 300;

type DraftRow = {
  path: string;
  op: "put" | "delete";
  content: ArrayBuffer | null;
  base_blob_sha: string | null;
  conflict: number;
  updated_at: number;
  updated_by: string;
};

/**
 * One per doc, named by doc id. It owns the doc's drafts, caches the repo at head so the
 * editor never reads git on the hot path, commits drafts to the doc's Artifacts repo, and keeps
 * one build per target at a time through the reducer in build-state.ts.
 */
export class Doc extends DurableObject<Env> {
  private sql: SqlStorage;
  // The preview that runs last, which the next one waits for. See preview().
  private previewing: Promise<unknown> = Promise.resolve();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS tree (path TEXT PRIMARY KEY, blob_sha TEXT NOT NULL, mode TEXT NOT NULL)",
    );
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS blobs (blob_sha TEXT PRIMARY KEY, content BLOB NOT NULL)",
    );
    this.sql.exec(`CREATE TABLE IF NOT EXISTS drafts (
      path TEXT PRIMARY KEY,
      op TEXT NOT NULL CHECK (op IN ('put', 'delete')),
      content BLOB,
      base_blob_sha TEXT,
      conflict INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL,
      updated_by TEXT NOT NULL,
      CHECK ((op = 'put') = (content IS NOT NULL))
    )`);
    this.sql.exec("CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
  }

  /**
   * Records the doc and, the first time, creates its repo and reads head. Safe to call before
   * every request: after the first call it only refreshes the doc's name.
   */
  async init(doc: DocInfo): Promise<void> {
    this.setMeta("doc", JSON.stringify(doc));
    if (this.meta("remote") !== null) return;

    const remote = await this.ensureRepo(doc.repo);
    await this.refresh();
    if (this.meta("head_sha") === null && this.loadDrafts().length === 0) {
      for (const draft of starterDrafts(doc.name, "shiru", Date.now())) this.writeDraft(draft);
    }
    this.setMeta("remote", remote);
  }

  getTree(): FileStatus[] {
    return overlay(this.loadTree(), this.loadDrafts());
  }

  async getFile(
    path: string,
  ): Promise<{ kind: "file"; content: Uint8Array } | { kind: "not_found" }> {
    const file = repoPath(DocPath.parse(path));
    const draft = this.loadDraft(file);
    if (draft)
      return draft.op === "put" ? { kind: "file", content: draft.content } : { kind: "not_found" };
    const entry = this.loadTree().get(file);
    if (!entry) return { kind: "not_found" };
    return { kind: "file", content: await this.blob(entry.sha) };
  }

  saveDraft(path: string, content: Uint8Array, user: Person): FileStatus {
    const file = repoPath(DocPath.parse(path));
    const previous = this.loadDraft(file);
    const tree = this.loadTree();
    const draft = putDraft(previous, tree, file, content, user.email, this.stamp(previous));
    this.writeDraft(draft);
    return this.statusOf(tree, draft);
  }

  deleteFile(path: string, user: Person): { kind: "deleted" } | { kind: "not_found" } {
    const file = repoPath(DocPath.parse(path));
    const previous = this.loadDraft(file);
    const outcome = deleteDraft(previous, this.loadTree(), file, user.email, this.stamp(previous));
    if (outcome.kind === "not_found") return outcome;
    if (outcome.kind === "discard") this.sql.exec("DELETE FROM drafts WHERE path = ?", file);
    else this.writeDraft(outcome.draft);
    return { kind: "deleted" };
  }

  discardDraft(path: string): { kind: "discarded" } | { kind: "not_found" } {
    const file = repoPath(DocPath.parse(path));
    const { rowsWritten } = this.sql.exec("DELETE FROM drafts WHERE path = ?", file);
    return rowsWritten > 0 ? { kind: "discarded" } : { kind: "not_found" };
  }

  /** Commits every draft that is not in conflict and builds the commit on the live target. */
  async publish(user: Person): Promise<PublishResult> {
    for (let attempt = 0; attempt < PUBLISH_ATTEMPTS; attempt++) {
      const head = this.meta("head_sha");
      const collected = this.loadDrafts();
      const skipped = collected
        .filter((draft) => draft.conflict)
        .map((draft) => relative(draft.path));
      const changes = committable(collected);
      if (changes.length === 0) {
        if (head !== null) await this.build(LIVE, head);
        return { kind: "unchanged", sha: head, skipped };
      }

      const commit = await buildCommit({
        tree: [...this.loadTree().values()],
        changes,
        parent: head,
        author: user,
        message: "Publish from the editor",
        time: Date.now() / 1000,
      });
      const pushed = await this.push(MAIN, head, commit);
      if (pushed.kind === "stale") {
        console.log(`publish: main moved past ${head ?? "nothing"} (stale ref); refreshing`);
        await this.refresh();
        continue;
      }
      if (pushed.kind === "failed") throw new Error(`The commit was rejected: ${pushed.message}`);

      const tree = toTree(commit.tree);
      this.ctx.storage.transactionSync(() => {
        this.replaceTree(tree);
        for (const object of commit.objects) {
          if (object.type === "blob") this.storeBlob(object.sha, object.body);
        }
        this.setMeta("head_sha", commit.sha);
        this.applyDraftUpdate(afterCommit(collected, this.loadDrafts(), tree), collected);
      });
      await this.build(LIVE, commit.sha);
      return { kind: "published", sha: commit.sha, skipped };
    }
    return { kind: "conflict" };
  }

  /**
   * Builds what the editor shows, drafts in conflict included, on the draft target. The drafts
   * are committed to the preview branch and stay drafts. Previewing again with nothing changed
   * pushes and builds nothing.
   *
   * One preview runs at a time. The Doc takes other requests while a preview awaits its commit,
   * push or build, so two at once could push or build an older snapshot after a newer one. Run in
   * turn, each later preview snapshots the drafts after the earlier one requested its build, so
   * the newest drafts are always built last.
   */
  preview(): Promise<PreviewResult> {
    const run = this.previewing.then(() => this.previewInTurn());
    this.previewing = run.catch(() => {});
    return run;
  }

  private async previewInTurn(): Promise<PreviewResult> {
    for (let attempt = 0; attempt < PUBLISH_ATTEMPTS; attempt++) {
      const head = this.meta("head_sha");
      const drafts = this.loadDrafts();
      let sha = head;
      if (drafts.length > 0) {
        const commit = await previewCommit([...this.loadTree().values()], drafts, head);
        const previewSha = this.meta("preview_sha");
        if (commit.sha !== previewSha) {
          const pushed = await this.push(PREVIEW, previewSha, commit);
          if (pushed.kind === "stale") {
            const repo = await this.env.ARTIFACTS.get(this.doc().repo);
            const [latest] = await repo.log({ ref: "preview", limit: 1 });
            if (latest) this.setMeta("preview_sha", latest.hash);
            else this.sql.exec("DELETE FROM meta WHERE key = 'preview_sha'");
            continue;
          }
          if (pushed.kind === "failed") {
            throw new Error(`The preview was rejected: ${pushed.message}`);
          }
          this.setMeta("preview_sha", commit.sha);
        }
        sha = commit.sha;
      }
      if (sha === null) return { kind: "empty" };

      // Recorded before the build, so a retire that reads the row after this keeps the preview, and
      // one that ran before it has already forgotten the target, which this build then rebuilds.
      const doc = await this.buildInfo();
      const requestedAt = new Date();
      await db
        .insert(previews)
        .values({ docId: doc.docId, label: DRAFT, requestedAt })
        .onConflictDoUpdate({ target: [previews.docId, previews.label], set: { requestedAt } });
      await this.build(DRAFT, sha);
      return { kind: "previewing", sha, url: previewUrl(doc.slug, DRAFT) };
    }
    return { kind: "conflict" };
  }

  async build(target: TargetLabel, sha: string): Promise<void> {
    await this.apply({ type: "requested", target, sha });
  }

  /** Builds what `target` serves again with the doc's current info, such as a new URL. */
  async rebuild(target: TargetLabel): Promise<void> {
    await this.apply({ type: "rebuild", target });
  }

  /**
   * Deletes `target`'s Worker and forgets its build, unless it is building or someone requested it
   * after `requestedBefore`, the time the cron chose it by. Running it twice converges.
   */
  async retire(
    target: TargetLabel,
    requestedBefore: number,
  ): Promise<{ kind: "retired" } | { kind: "busy" } | { kind: "fresh" }> {
    return this.ctx.blockConcurrencyWhile(async () => {
      if (this.builds().targets[target]?.kind === "building") return { kind: "busy" };
      const doc = await this.buildInfo();
      const [row] = await db
        .select({ requestedAt: previews.requestedAt })
        .from(previews)
        .where(and(eq(previews.docId, doc.docId), eq(previews.label, target)));
      if (row && row.requestedAt.getTime() > requestedBefore) return { kind: "fresh" };
      const deleted = await deleteBuild({
        env: this.env,
        scriptName: workerName(doc.slug, target),
      });
      if (!deleted.ok) throw new Error(deleted.error);

      await this.apply({ type: "retired", target });
      const { [target]: _, ...runs } = this.runs();
      this.setMeta("runs", JSON.stringify(runs));
      await db
        .delete(previews)
        .where(
          and(
            eq(previews.docId, doc.docId),
            eq(previews.label, target),
            lte(previews.requestedAt, new Date(requestedBefore)),
          ),
        );
      return { kind: "retired" };
    });
  }

  /** Called by the PublishWorkflow when a build ends, on success and on failure. */
  async buildFinished(target: TargetLabel, workflowId: string, result: BuildResult): Promise<void> {
    await this.apply({ type: "finished", target, workflowId, result });
  }

  /** Called by the PublishWorkflow as a build enters each step, for the dashboard's timeline. */
  buildStep(target: TargetLabel, workflowId: string, step: BuildStep): void {
    const runs = this.runs();
    const run = runs[target];
    if (!run) return;
    this.setMeta(
      "runs",
      JSON.stringify({ ...runs, [target]: enterStep(run, workflowId, step, Date.now()) }),
    );
  }

  status(): DocStatus {
    return {
      headSha: this.meta("head_sha"),
      targets: this.builds().targets,
      runs: this.runs(),
      drafts: this.loadDrafts().map((draft) => ({
        path: relative(draft.path),
        op: draft.op,
        conflict: draft.conflict,
        updatedAt: draft.updatedAt,
        updatedBy: draft.updatedBy,
      })),
    };
  }

  /** Whether `workflowId` is still the build `target` is waiting on, so it may deploy. */
  isCurrentBuild(target: TargetLabel, workflowId: string): boolean {
    return isCurrentBuild(this.builds(), target, workflowId);
  }

  /** Reconciles every building target with its Workflow instance, so none stays building forever. */
  override async alarm(): Promise<void> {
    for (const [target, state] of Object.entries(this.builds().targets)) {
      if (state?.kind !== "building") continue;
      const { workflowId } = state.build;
      let instance: InstanceStatus;
      try {
        instance = parseInstanceStatus(
          await (await this.env.PUBLISH_WORKFLOW.get(workflowId)).status(),
        );
      } catch (error) {
        instance = lookupFailure(error);
      }
      await this.apply({
        type: "reconciled",
        target: target as TargetLabel,
        workflowId,
        instance,
      });
    }
  }

  private async apply(event: BuildEvent) {
    const { state, effects } = applyBuildEvent(this.builds(), event);
    // Recorded before any effect runs, so a crash before `create` leaves an id the alarm can check.
    this.setMeta("builds", JSON.stringify(state));
    const now = Date.now();
    const runs = this.runs();
    for (const [target, run] of Object.entries(runs) as [TargetLabel, Run][]) {
      runs[target] = endRun(run, state.targets[target], now);
    }
    for (const effect of effects) {
      if (effect.type === "startWorkflow") {
        runs[effect.target] = startRun(effect.workflowId, effect.sha, now);
      }
    }
    this.setMeta("runs", JSON.stringify(runs));
    for (const effect of effects) {
      switch (effect.type) {
        case "setAlarm":
          await this.ctx.storage.setAlarm(Date.now() + ALARM_DELAY_MS);
          break;
        case "clearAlarm":
          await this.ctx.storage.deleteAlarm();
          break;
        case "startWorkflow": {
          try {
            const doc = await this.buildInfo();
            const params: PublishParams = {
              docId: doc.docId,
              slug: doc.slug,
              repo: doc.repo,
              target: effect.target,
              sha: effect.sha,
              docUrl: effect.target === LIVE ? doc.docUrl : previewUrl(doc.slug, effect.target),
              docsRoot: DOCS_ROOT,
            };
            await this.env.PUBLISH_WORKFLOW.create({ id: effect.workflowId, params });
          } catch (error) {
            // The alarm finds the instance missing and starts the build again.
            console.error(`could not start ${effect.workflowId}`, error);
          }
          break;
        }
      }
    }
  }

  /** Moves the cache to the branch's current head, flagging drafts the move conflicts with. */
  private async refresh() {
    const repo = await this.env.ARTIFACTS.get(this.doc().repo);
    const [latest] = await repo.log({ limit: 1 });
    const head = latest?.hash ?? null;
    if (head === this.meta("head_sha")) return;

    const tree = toTree(head ? await readCommitTree(repo, head) : []);
    const missing = new Set<string>();
    for (const entry of tree.values()) {
      if (entry.path.startsWith(DOCS_ROOT) && !this.hasBlob(entry.sha)) missing.add(entry.sha);
    }
    const blobs = await Promise.all(
      [...missing].map(async (sha) => [sha, await readBlob(repo, sha)] as const),
    );
    const collected = this.loadDrafts();
    const update = await reconcileDrafts(collected, tree);
    this.ctx.storage.transactionSync(() => {
      this.replaceTree(tree);
      for (const [sha, content] of blobs) this.storeBlob(sha, content);
      if (head === null) this.sql.exec("DELETE FROM meta WHERE key = 'head_sha'");
      else this.setMeta("head_sha", head);
      this.applyDraftUpdate(update, collected);
    });
  }

  private async push(ref: Ref, old: string | null, commit: BuiltCommit): Promise<PushResult> {
    const repo = await this.env.ARTIFACTS.get(this.doc().repo);
    const { plaintext } = await repo.createToken("write", TOKEN_TTL_SECONDS);
    const response = await fetch(`${this.meta("remote")}/git-receive-pack`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${plaintext}`,
        "content-type": "application/x-git-receive-pack-request",
        accept: "application/x-git-receive-pack-result",
      },
      body: receivePackRequest(ref, old, commit.sha, await packfile(commit.objects)),
    });
    const body = await response.text();
    if (!response.ok)
      return { kind: "failed", message: `HTTP ${response.status}: ${body.slice(0, 500)}` };
    return parseReportStatus(ref, body);
  }

  // Get, else create, else get again for a create that lost a race. Errors are not classified by
  // code: through `cf dev`'s remote binding they arrive as plain Errors without one.
  private async ensureRepo(name: string): Promise<string> {
    const remote = async () => (await (await this.env.ARTIFACTS.get(name)).info()).remote;
    try {
      return await remote();
    } catch {
      try {
        return (await this.env.ARTIFACTS.create(name)).remote;
      } catch {
        return remote();
      }
    }
  }

  private async blob(sha: string) {
    const [row] = this.sql
      .exec<{ content: ArrayBuffer }>("SELECT content FROM blobs WHERE blob_sha = ?", sha)
      .toArray();
    if (row) return new Uint8Array(row.content);
    const content = await readBlob(await this.env.ARTIFACTS.get(this.doc().repo), sha);
    this.storeBlob(sha, content);
    return content;
  }

  private hasBlob(sha: string) {
    return this.sql.exec("SELECT 1 FROM blobs WHERE blob_sha = ?", sha).toArray().length > 0;
  }

  private storeBlob(sha: string, content: Uint8Array) {
    this.sql.exec(
      "INSERT OR IGNORE INTO blobs (blob_sha, content) VALUES (?, ?)",
      sha,
      buffer(content),
    );
  }

  private loadTree(): Tree {
    const rows = this.sql
      .exec<{ path: string; blob_sha: string; mode: string }>(
        "SELECT path, blob_sha, mode FROM tree",
      )
      .toArray();
    return toTree(rows.map((row) => ({ path: row.path, sha: row.blob_sha, mode: row.mode })));
  }

  private replaceTree(tree: Tree) {
    this.sql.exec("DELETE FROM tree");
    for (const entry of tree.values()) {
      this.sql.exec(
        "INSERT INTO tree (path, blob_sha, mode) VALUES (?, ?, ?)",
        entry.path,
        entry.sha,
        entry.mode,
      );
    }
  }

  private loadDrafts(): Draft[] {
    return this.sql.exec<DraftRow>("SELECT * FROM drafts ORDER BY path").toArray().map(toDraft);
  }

  private loadDraft(path: string): Draft | undefined {
    const [row] = this.sql.exec<DraftRow>("SELECT * FROM drafts WHERE path = ?", path).toArray();
    return row ? toDraft(row) : undefined;
  }

  private writeDraft(draft: Draft) {
    this.sql.exec(
      `INSERT OR REPLACE INTO drafts (path, op, content, base_blob_sha, conflict, updated_at, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      draft.path,
      draft.op,
      draft.op === "put" ? buffer(draft.content) : null,
      draft.baseBlobSha,
      draft.conflict ? 1 : 0,
      draft.updatedAt,
      draft.updatedBy,
    );
  }

  // Each write is guarded by the updated_at the decision was made on, so an edit saved while the
  // decision awaited the network is never cleared or overwritten.
  private applyDraftUpdate(update: DraftUpdate, collected: Draft[]) {
    const seen = new Map(collected.map((draft) => [draft.path, draft.updatedAt]));
    for (const path of update.clear) {
      this.sql.exec("DELETE FROM drafts WHERE path = ? AND updated_at = ?", path, seen.get(path)!);
    }
    for (const draft of update.save) {
      this.sql.exec(
        "UPDATE drafts SET base_blob_sha = ?, conflict = ? WHERE path = ? AND updated_at = ?",
        draft.baseBlobSha,
        draft.conflict ? 1 : 0,
        draft.path,
        draft.updatedAt,
      );
    }
  }

  // Strictly increasing per file, so publish can tell an edit made in the same millisecond apart.
  private stamp(previous: Draft | undefined) {
    return Math.max(Date.now(), (previous?.updatedAt ?? 0) + 1);
  }

  private statusOf(tree: Tree, draft: Draft): FileStatus {
    const entry = tree.get(draft.path);
    return overlay(toTree(entry ? [entry] : []), [draft])[0]!;
  }

  private builds(): DocBuilds {
    const stored = this.meta("builds");
    const fresh = initialBuilds(`${this.doc().docId}--${crypto.randomUUID().slice(0, 8)}`);
    // State saved before the prefix existed takes a fresh one.
    return stored ? { ...fresh, ...(JSON.parse(stored) as DocBuilds) } : fresh;
  }

  /**
   * What a Workflow needs, with the slug and URL read from D1 as the build starts. The URL changes
   * with the doc's custom domain, and a build waiting in the queue must not use an old one.
   */
  private async buildInfo(): Promise<DocInfo & { docUrl: string }> {
    const doc = this.doc();
    const served = await servedAt(doc.docId, this.env);
    if (!served) throw new Error(`doc ${doc.docId} is not in the database`);
    return { ...doc, slug: served.slug, docUrl: served.url };
  }

  private doc(): DocInfo {
    const stored = this.meta("doc");
    if (!stored) throw new Error("init was never called for this doc");
    return JSON.parse(stored) as DocInfo;
  }

  private runs(): Runs {
    const stored = this.meta("runs");
    return stored ? (JSON.parse(stored) as Runs) : {};
  }

  private meta(key: string): string | null {
    const [row] = this.sql
      .exec<{ value: string }>("SELECT value FROM meta WHERE key = ?", key)
      .toArray();
    return row?.value ?? null;
  }

  private setMeta(key: string, value: string) {
    this.sql.exec("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)", key, value);
  }
}

function toDraft(row: DraftRow): Draft {
  const base = {
    path: row.path,
    baseBlobSha: row.base_blob_sha,
    conflict: row.conflict === 1,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
  return row.op === "put"
    ? { ...base, op: "put", content: new Uint8Array(row.content!) }
    : { ...base, op: "delete" };
}

const relative = (path: string) => path.slice(DOCS_ROOT.length);

function buffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer as ArrayBuffer;
}
