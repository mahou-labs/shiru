import { getSandbox } from "@cloudflare/sandbox";
import { ORPCError } from "@orpc/server";
import { WorkflowEntrypoint, WorkflowStep, type WorkflowEvent, env } from "cloudflare:workers";
import { NonRetryableError } from "cloudflare:workflows";
import { and, desc, eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import z from "zod";

import { organizations } from "@/schema/auth";
import { docsSites, docsVersions } from "@/schema/docs";
import { db } from "@/utils/db";
import { log } from "@/utils/logger";
import { getInstallationOctokit } from "@/utils/oktokit";
import { protectedProcedure } from "@/utils/orpc";

export const docsRouter = {
  getSiteSettings: protectedProcedure.handler(async ({ context: { session } }) => {
    if (!session.activeOrganizationId) {
      throw new ORPCError("Organization not found");
    }

    const [{ id, activeCommitSha }] = await db
      .select({
        id: docsSites.id,
        activeCommitSha: docsSites.activeCommitSha,
      })
      .from(docsSites)
      .where(eq(docsSites.organizationId, session.activeOrganizationId));

    if (!id) {
      throw new ORPCError("Docs site not found");
    }

    return { id, activeCommitSha };
  }),

  publish: protectedProcedure
    .input(
      z.object({
        docsSiteId: z.string(),
      }),
    )
    .handler(async ({ input, context: { session } }) => {
      if (!session.activeOrganizationId) {
        throw new ORPCError("Organization not found");
      }

      // Authorization: verify the docs site belongs to the caller's active org.
      // Without this check, any authenticated user could trigger publishes for
      // other orgs by guessing/enumerating UUIDv7 docs site ids.
      const [ownedSite] = await db
        .select({ id: docsSites.id })
        .from(docsSites)
        .where(
          and(
            eq(docsSites.id, input.docsSiteId),
            eq(docsSites.organizationId, session.activeOrganizationId),
          ),
        );

      if (!ownedSite) {
        throw new ORPCError("Docs site not found");
      }

      const instanceId = uuidv7();

      log.info("Creating publish workflow", {
        instanceId,
        docsSiteId: input.docsSiteId,
        organizationId: session.activeOrganizationId,
        requestedByUserId: session.userId,
      });

      const instance = await env.PUBLISH_DOCS.create({
        id: instanceId,
        params: {
          docsSiteId: input.docsSiteId,
          organizationId: session.activeOrganizationId,
          instanceId,
          requestedByUserId: session.userId,
        },
      });

      const status = await instance.status();
      log.info("Workflow instance created", { instanceId: instance.id, status });

      return { instanceId: instance.id };
    }),
};

// Allow only paths that are safe to interpolate into filesystem operations and
// shell commands. We deliberately reject anything outside this set rather than
// trying to escape — file paths originate from a (potentially attacker-owned)
// GitHub repository and are written into the build sandbox.
const SAFE_PATH_SEGMENT = /^[A-Za-z0-9._-]+$/;

const validateDocsFilePath = (path: string): void => {
  if (!path || path.length > 1024) {
    throw new NonRetryableError(`Invalid docs file path: empty or too long`);
  }
  if (path.startsWith("/") || path.includes("\\")) {
    throw new NonRetryableError(`Invalid docs file path: ${path}`);
  }

  const segments = path.split("/");
  for (const segment of segments) {
    if (segment === "" || segment === "." || segment === "..") {
      throw new NonRetryableError(`Invalid docs file path segment in: ${path}`);
    }
    if (!SAFE_PATH_SEGMENT.test(segment)) {
      throw new NonRetryableError(`Unsafe characters in docs file path: ${path}`);
    }
  }
};

const ALIVE_WORKFLOW_STATUSES = new Set([
  "queued",
  "running",
  "paused",
  "waiting",
  "waitingForPause",
]);

const isWorkflowAlive = async (instanceId: string): Promise<boolean> => {
  try {
    const instance = await env.PUBLISH_DOCS.get(instanceId);
    const status = await instance.status();
    return ALIVE_WORKFLOW_STATUSES.has(status.status);
  } catch {
    // Instance not found / expired retention / API error → treat as not alive
    // so a new workflow can take over the stuck row.
    return false;
  }
};

const resolveCommitSha = async (docsSite: typeof docsSites.$inferSelect): Promise<string> => {
  if (
    !docsSite.githubInstallationId ||
    !docsSite.githubOwner ||
    !docsSite.githubRepository ||
    !docsSite.publishableBranch
  ) {
    throw new NonRetryableError("Docs site is not connected to a GitHub repository");
  }

  const octokit = getInstallationOctokit(docsSite.githubInstallationId);
  const { data: ref } = await octokit.rest.git.getRef({
    owner: docsSite.githubOwner,
    repo: docsSite.githubRepository,
    ref: `heads/${docsSite.publishableBranch}`,
  });

  return ref.object.sha;
};

const getGithubFilesAtCommit = async (
  docsSite: typeof docsSites.$inferSelect,
  commitSha: string,
): Promise<{ path: string; content: Uint8Array }[]> => {
  const { githubInstallationId, githubOwner, githubRepository, contentPath } = docsSite;

  if (!githubInstallationId || !githubOwner || !githubRepository) {
    throw new NonRetryableError("Docs site is not connected to a GitHub repository");
  }

  const octokit = getInstallationOctokit(githubInstallationId);
  let treeSha = commitSha;

  if (contentPath !== "" && contentPath !== "/") {
    const segments = contentPath.replace(/^\//, "").replace(/\/$/, "").split("/");

    for (const segment of segments) {
      // oxlint-disable-next-line no-await-in-loop
      const { data: parentTree } = await octokit.rest.git.getTree({
        owner: githubOwner,
        repo: githubRepository,
        tree_sha: treeSha,
      });

      const entry = parentTree.tree.find((e) => e.path === segment && e.type === "tree");

      if (!entry?.sha) {
        throw new NonRetryableError(`Path "${contentPath}" not found in repository`);
      }

      treeSha = entry.sha;
    }
  }

  const { data: tree } = await octokit.rest.git.getTree({
    owner: githubOwner,
    repo: githubRepository,
    tree_sha: treeSha,
    recursive: "1",
  });

  const blobs = tree.tree.filter((entry) => entry.type === "blob" && entry.sha);

  const BATCH_SIZE = 10;
  const files: { path: string; content: Uint8Array }[] = [];

  for (let i = 0; i < blobs.length; i += BATCH_SIZE) {
    const batch = blobs.slice(i, i + BATCH_SIZE);

    // oxlint-disable-next-line no-await-in-loop
    const results = await Promise.all(
      batch.map(async (entry) => {
        const { data: blob } = await octokit.rest.git.getBlob({
          owner: githubOwner,
          repo: githubRepository,
          file_sha: entry.sha,
        });

        const binary = atob(blob.content);
        const bytes = new Uint8Array(binary.length);
        for (let j = 0; j < binary.length; j++) {
          bytes[j] = binary.charCodeAt(j);
        }

        return { path: entry.path, content: bytes };
      }),
    );

    files.push(...results);
  }

  return files;
};

type PublishWorkflowPayload = {
  docsSiteId: string;
  organizationId: string;
  instanceId: string;
  requestedByUserId: string;
};

export class PublishDocsWorkflow extends WorkflowEntrypoint<typeof env, PublishWorkflowPayload> {
  async run(event: WorkflowEvent<PublishWorkflowPayload>, step: WorkflowStep) {
    log.info("Workflow started", { payload: event.payload });

    const { docsSite, slug } = await step.do("fetch-site-and-org", async () => {
      // Scope the fetch by org id so a stale/forged workflow params payload
      // can't pull a site that doesn't belong to the requesting org.
      const [site] = await db
        .select()
        .from(docsSites)
        .where(
          and(
            eq(docsSites.id, event.payload.docsSiteId),
            eq(docsSites.organizationId, event.payload.organizationId),
          ),
        );

      const [org] = await db
        .select({ slug: organizations.slug })
        .from(organizations)
        .where(eq(organizations.id, event.payload.organizationId));

      if (!site || !org) {
        log.error("publish.fetch_site_failed", {
          docsSiteId: event.payload.docsSiteId,
          organizationId: event.payload.organizationId,
          siteFound: !!site,
          orgFound: !!org,
        });
        throw new NonRetryableError("Docs site or organization not found");
      }

      log.info("publish.site_fetched", { siteId: site.id, slug: org.slug });
      return { docsSite: site, slug: org.slug };
    });

    // Resolve the commit SHA up front (cheap, single API call) so we can
    // reconcile the version row before paying for the full tree+blob fetch.
    const commitSha = await step.do("resolve-commit-sha", async () => {
      const sha = await resolveCommitSha(docsSite);
      log.info("publish.commit_sha_resolved", { commitSha: sha.slice(0, 7) });
      return sha;
    });

    // Reconcile the version row: insert new, retry failed, take over stale
    // building rows whose owning workflow is dead, or skip published / live.
    const action = await step.do("reconcile-version", async () => {
      const [existing] = await db
        .select({
          id: docsVersions.id,
          status: docsVersions.status,
          workflowInstanceId: docsVersions.workflowInstanceId,
        })
        .from(docsVersions)
        .where(
          and(
            eq(docsVersions.docsSiteId, event.payload.docsSiteId),
            eq(docsVersions.versionRef, commitSha),
          ),
        );

      if (existing) {
        if (existing.status === "published") {
          log.info("publish.skip_already_published", { versionRef: commitSha.slice(0, 7) });
          return "skip" as const;
        }

        if (existing.status === "building") {
          if (existing.workflowInstanceId === event.payload.instanceId) {
            // Same workflow resuming after eviction — keep going.
            log.info("publish.resume_own_building", { versionRef: commitSha.slice(0, 7) });
            return "retry" as const;
          }

          const alive = await isWorkflowAlive(existing.workflowInstanceId);
          if (alive) {
            log.info("publish.skip_already_building", {
              versionRef: commitSha.slice(0, 7),
              ownerWorkflowInstanceId: existing.workflowInstanceId,
            });
            return "skip" as const;
          }

          // Stuck building → take ownership and retry.
          await db
            .update(docsVersions)
            .set({
              workflowInstanceId: event.payload.instanceId,
              requestedByUserId: event.payload.requestedByUserId,
            })
            .where(eq(docsVersions.id, existing.id));

          log.info("publish.takeover_stale_building", {
            versionRef: commitSha.slice(0, 7),
            previousWorkflowInstanceId: existing.workflowInstanceId,
          });
          return "retry" as const;
        }

        // status === "failed" → flip back to building, take ownership.
        await db
          .update(docsVersions)
          .set({
            status: "building",
            workflowInstanceId: event.payload.instanceId,
            requestedByUserId: event.payload.requestedByUserId,
          })
          .where(eq(docsVersions.id, existing.id));

        log.info("publish.retry_failed_version", { versionRef: commitSha.slice(0, 7) });
        return "retry" as const;
      }

      await db.insert(docsVersions).values({
        docsSiteId: event.payload.docsSiteId,
        workflowInstanceId: event.payload.instanceId,
        requestedByUserId: event.payload.requestedByUserId,
        versionRef: commitSha,
        status: "building",
      });

      log.info("publish.version_created", { versionRef: commitSha.slice(0, 7) });
      return "created" as const;
    });

    if (action === "skip") {
      return;
    }

    try {
      const files = await step.do("fetch-github-files", async () => {
        log.info("publish.fetching_github_files", {
          owner: docsSite.githubOwner,
          repo: docsSite.githubRepository,
          commitSha: commitSha.slice(0, 7),
        });

        const result = await getGithubFilesAtCommit(docsSite, commitSha);

        // Validate every path before any of them touches the filesystem or R2.
        // A bad path is unrecoverable for this commit — fail the version.
        for (const file of result) {
          validateDocsFilePath(file.path);
        }

        log.info("publish.github_files_fetched", { fileCount: result.length });
        return result;
      });

      await step.do("upload-source-to-r2", async () => {
        log.info("publish.uploading_source", {
          fileCount: files.length,
          prefix: `${slug}/${commitSha.slice(0, 7)}`,
        });

        await Promise.all(
          files.map((file) =>
            env.DOCS_SOURCE.put(`${slug}/${commitSha}/${file.path}`, file.content),
          ),
        );

        log.info("publish.source_uploaded", { fileCount: files.length });
      });

      const builtFiles = await step.do(
        "build-in-sandbox",
        // Transient sandbox/network failures get a couple of retries; deterministic
        // build failures throw NonRetryableError below to skip the retry budget.
        { retries: { limit: 2, delay: "10 seconds", backoff: "exponential" } },
        async () => {
          // Per-instance sandbox name so concurrent publishes don't collide on the same DO.
          const sandbox = getSandbox(env.BUILDER_SANDBOX, `builder-${event.payload.instanceId}`);

          try {
            // Wipe any stale content from a prior build before writing new files.
            // Use the typed mkdir API instead of `exec("mkdir -p ...")` so attacker-
            // controlled file paths can't be smuggled into a shell command line.
            await sandbox.exec("rm -rf /workspace/starlight/src/content/docs");
            await sandbox.mkdir("/workspace/starlight/src/content/docs", { recursive: true });

            log.info("publish.writing_files_to_sandbox", { fileCount: files.length });

            const BATCH_SIZE = 10;
            for (let i = 0; i < files.length; i += BATCH_SIZE) {
              const batch = files.slice(i, i + BATCH_SIZE);
              // oxlint-disable-next-line no-await-in-loop
              await Promise.all(
                batch.map(async (file) => {
                  const fullPath = `/workspace/starlight/src/content/docs/${file.path}`;
                  const dir = fullPath.replace(/\/[^/]+$/, "");
                  await sandbox.mkdir(dir, { recursive: true });
                  const b64 = btoa(String.fromCharCode(...new Uint8Array(file.content)));
                  await sandbox.writeFile(fullPath, b64, { encoding: "base64" });
                }),
              );
            }

            log.info("publish.sandbox_files_written", { fileCount: files.length });

            const result = await sandbox.exec(
              "cd /workspace/starlight && bun --bun run build-docs",
            );

            if (!result.success) {
              log.error("publish.sandbox_build_failed", {
                exitCode: result.exitCode,
                stderr: result.stderr,
              });
              // Compile/build failures won't fix themselves — don't burn retries on them.
              throw new NonRetryableError(`Sandbox build failed: ${result.stderr}`);
            }

            log.info("publish.sandbox_build_complete", {
              buildLogs: result.stderr,
              exitCode: result.exitCode,
            });

            const buildOutputSchema = z.object({
              files: z.array(z.object({ path: z.string(), content: z.string() })),
            });
            const { files: distFiles } = buildOutputSchema.parse(JSON.parse(result.stdout));

            log.info("publish.dist_collected", { distFileCount: distFiles.length });
            return distFiles;
          } finally {
            try {
              await sandbox.destroy();
            } catch (destroyError) {
              // Don't let cleanup mask the original build error.
              log.error("publish.sandbox_destroy_failed", {
                errorMessage:
                  destroyError instanceof Error ? destroyError.message : String(destroyError),
              });
            }
          }
        },
      );

      await step.do("upload-dist-to-r2", async () => {
        log.info("publish.uploading_dist", {
          fileCount: builtFiles.length,
          prefix: `${slug}/${commitSha.slice(0, 7)}`,
        });

        const BATCH_SIZE = 20;
        for (let i = 0; i < builtFiles.length; i += BATCH_SIZE) {
          const batch = builtFiles.slice(i, i + BATCH_SIZE);
          // oxlint-disable-next-line no-await-in-loop
          await Promise.all(
            batch.map((file) => {
              const bytes = Uint8Array.from(atob(file.content), (c) => c.charCodeAt(0));
              return env.DOCS_DIST.put(`${slug}/${commitSha}/${file.path}`, bytes);
            }),
          );
        }

        log.info("publish.dist_uploaded", { fileCount: builtFiles.length });
      });

      await step.do("mark-published", async () => {
        // Filter by workflowInstanceId so a stale workflow that lost ownership
        // (e.g., another run took over a stuck row) can't update the row.
        await db
          .update(docsVersions)
          .set({ status: "published" })
          .where(
            and(
              eq(docsVersions.docsSiteId, event.payload.docsSiteId),
              eq(docsVersions.versionRef, commitSha),
              eq(docsVersions.workflowInstanceId, event.payload.instanceId),
            ),
          );

        // Pick the newest published version as active. This is monotonic —
        // out-of-order completions of older commits cannot demote the live site.
        const [newest] = await db
          .select({ versionRef: docsVersions.versionRef })
          .from(docsVersions)
          .where(
            and(
              eq(docsVersions.docsSiteId, event.payload.docsSiteId),
              eq(docsVersions.status, "published"),
            ),
          )
          .orderBy(desc(docsVersions.createdAt))
          .limit(1);

        if (newest) {
          await db
            .update(docsSites)
            .set({ activeCommitSha: newest.versionRef })
            .where(eq(docsSites.id, event.payload.docsSiteId));
        }

        log.info("publish.marked_published", {
          versionRef: commitSha.slice(0, 7),
          activeCommitSha: newest?.versionRef.slice(0, 7),
          docsSiteId: event.payload.docsSiteId,
        });
      });
    } catch (error) {
      // Mark failed FIRST so the row state is correct even if cleanup later
      // fails. Filter by workflowInstanceId so a stale workflow that lost
      // ownership of the row doesn't clobber the new owner's status.
      await step.do("mark-failed", async () => {
        await db
          .update(docsVersions)
          .set({ status: "failed" })
          .where(
            and(
              eq(docsVersions.docsSiteId, event.payload.docsSiteId),
              eq(docsVersions.versionRef, commitSha),
              eq(docsVersions.workflowInstanceId, event.payload.instanceId),
            ),
          );

        log.error("publish.marked_failed", {
          versionRef: commitSha.slice(0, 7),
          docsSiteId: event.payload.docsSiteId,
          errorMessage: error instanceof Error ? error.message : String(error),
        });
      });

      // Best-effort cleanup of any partial source/dist artifacts uploaded for
      // this commit so failed publishes don't accumulate in R2 indefinitely.
      await step.do("cleanup-failed-artifacts", async () => {
        const prefix = `${slug}/${commitSha}/`;
        let totalDeleted = 0;

        for (const bucket of [env.DOCS_SOURCE, env.DOCS_DIST]) {
          let cursor: string | undefined;
          do {
            // oxlint-disable-next-line no-await-in-loop
            const list = await bucket.list({ prefix, cursor });
            if (list.objects.length > 0) {
              const keys = list.objects.map((o) => o.key);
              // oxlint-disable-next-line no-await-in-loop
              await bucket.delete(keys);
              totalDeleted += keys.length;
            }
            cursor = list.truncated ? list.cursor : undefined;
          } while (cursor);
        }

        log.info("publish.cleanup_failed_artifacts", {
          versionRef: commitSha.slice(0, 7),
          deletedCount: totalDeleted,
        });
      });

      throw error;
    }
  }
}
