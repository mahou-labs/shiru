import { getSandbox } from "@cloudflare/sandbox";
import { ORPCError } from "@orpc/server";
import { WorkflowEntrypoint, WorkflowStep, type WorkflowEvent, env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import z from "zod";

import { organizations } from "@/schema/auth";
import { docsSites, docsVersions } from "@/schema/docs";
import { db } from "@/utils/db";
import { log } from "@/utils/logger";
import { getInstallationOctokit } from "@/utils/oktokit";
import { protectedProcedure } from "@/utils/orpc";
import { tryCatch } from "@/utils/try-catch";

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

      const instanceId = uuidv7();

      log.info("Creating publish workflow", {
        instanceId,
        docsSiteId: input.docsSiteId,
        organizationId: session.activeOrganizationId,
      });

      const instance = await env.PUBLISH_DOCS.create({
        id: instanceId,
        params: {
          docsSiteId: input.docsSiteId,
          organizationId: session.activeOrganizationId,
          instanceId,
        },
      });

      const status = await instance.status();
      log.info("Workflow instance created", { instanceId: instance.id, status });

      return { instanceId: instance.id };
    }),
};

const getGithubFiles = async (docsSite: typeof docsSites.$inferSelect) => {
  if (
    docsSite.githubInstallationId &&
    docsSite.githubOwner &&
    docsSite.githubRepository &&
    docsSite.publishableBranch
  ) {
    const octokit = getInstallationOctokit(docsSite.githubInstallationId);
    const { data: ref } = await octokit.rest.git.getRef({
      owner: docsSite.githubOwner,
      repo: docsSite.githubRepository,
      ref: `heads/${docsSite.publishableBranch}`,
    });

    let treeSha = ref.object.sha;

    if (docsSite.contentPath !== "" && docsSite.contentPath !== "/") {
      const segments = docsSite.contentPath.replace(/^\//, "").replace(/\/$/, "").split("/");

      for (const segment of segments) {
        // oxlint-disable-next-line no-await-in-loop
        const { data: parentTree } = await octokit.rest.git.getTree({
          owner: docsSite.githubOwner,
          repo: docsSite.githubRepository,
          tree_sha: treeSha,
        });

        const entry = parentTree.tree.find((e) => e.path === segment && e.type === "tree");

        if (!entry?.sha) {
          throw new ORPCError(`Path "${docsSite.contentPath}" not found in repository`);
        }

        treeSha = entry.sha;
      }
    }

    const { data: tree } = await octokit.rest.git.getTree({
      owner: docsSite.githubOwner,
      repo: docsSite.githubRepository,
      tree_sha: treeSha,
      recursive: "1",
    });

    const blobs = tree.tree.filter((entry) => entry.type === "blob" && entry.sha);

    const BATCH_SIZE = 10;
    const commitSha = ref.object.sha;
    const files: { path: string; content: Uint8Array }[] = [];

    for (let i = 0; i < blobs.length; i += BATCH_SIZE) {
      const batch = blobs.slice(i, i + BATCH_SIZE);

      // oxlint-disable-next-line no-await-in-loop
      const results = await Promise.all(
        batch.map(async (entry) => {
          const { data: blob } = await octokit.rest.git.getBlob({
            owner: docsSite.githubOwner!,
            repo: docsSite.githubRepository!,
            file_sha: entry.sha!,
          });

          const binary = atob(blob.content);
          const bytes = new Uint8Array(binary.length);
          for (let j = 0; j < binary.length; j++) {
            bytes[j] = binary.charCodeAt(j);
          }

          return { path: entry.path!, content: bytes };
        }),
      );

      files.push(...results);
    }

    return { files, commitSha };
  }
};

type WorflowPayload = { docsSiteId: string; organizationId: string; instanceId: string };

export class PublishDocsWorkflow extends WorkflowEntrypoint<typeof env, WorflowPayload> {
  async run(event: WorkflowEvent<WorflowPayload>, step: WorkflowStep) {
    log.info("Workflow started", { payload: event.payload });

    const { docsSite, slug } = await step.do("fetch-site-and-org", async () => {
      const [site] = await db
        .select()
        .from(docsSites)
        .where(eq(docsSites.id, event.payload.docsSiteId));

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
        throw new Error("Docs site or organization not found");
      }

      log.info("publish.site_fetched", { siteId: site.id, slug: org.slug });
      return { docsSite: site, slug: org.slug };
    });

    const { files, commitSha } = await step.do("fetch-github-files", async () => {
      log.info("publish.fetching_github_files", {
        owner: docsSite.githubOwner,
        repo: docsSite.githubRepository,
        branch: docsSite.publishableBranch,
      });

      const result = await getGithubFiles(docsSite);
      if (!result) {
        log.error("publish.no_github_files", { docsSiteId: docsSite.id });
        throw new Error("No files found");
      }

      log.info("publish.github_files_fetched", {
        fileCount: result.files.length,
        commitSha: result.commitSha.slice(0, 7),
      });
      return result;
    });

    const alreadyExists = await step.do("check-existing-version", async () => {
      const [existing] = await db
        .select({ id: docsVersions.id })
        .from(docsVersions)
        .where(
          and(
            eq(docsVersions.docsSiteId, event.payload.docsSiteId),
            eq(docsVersions.versionRef, commitSha),
          ),
        );

      if (existing) {
        log.info("publish.version_already_exists", { versionRef: commitSha.slice(0, 7) });
        return true;
      }

      return false;
    });

    if (alreadyExists) {
      return;
    }

    await step.do("save-version", async () => {
      await db.insert(docsVersions).values({
        docsSiteId: event.payload.docsSiteId,
        workflowInstanceId: event.payload.instanceId,
        versionRef: commitSha,
      });

      log.info("publish.version_saved", { versionRef: commitSha.slice(0, 7) });
    });

    await step.do("upload-source-to-r2", async () => {
      log.info("publish.uploading_source", {
        fileCount: files.length,
        prefix: `${slug}/${commitSha.slice(0, 7)}`,
      });

      await Promise.all(
        files.map((file) => env.DOCS_SOURCE.put(`${slug}/${commitSha}/${file.path}`, file.content)),
      );

      log.info("publish.source_uploaded", { fileCount: files.length });
    });

    const builtFiles = await step.do("build-in-sandbox", async () => {
      const sandbox = getSandbox(env.BUILDER_SANDBOX, "builder-sandbox");

      try {
        // Write source files into the sandbox
        await sandbox.exec("mkdir -p /workspace/starlight/src/content/docs");

        log.info("publish.writing_files_to_sandbox", { fileCount: files.length });

        const BATCH_SIZE = 10;
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
          const batch = files.slice(i, i + BATCH_SIZE);
          // oxlint-disable-next-line no-await-in-loop
          await Promise.all(
            batch.map(async (file) => {
              const dir = `/workspace/starlight/src/content/docs/${file.path}`.replace(
                /\/[^/]+$/,
                "",
              );
              await sandbox.exec(`mkdir -p ${dir}`);
              const b64 = btoa(String.fromCharCode(...new Uint8Array(file.content)));
              await sandbox.writeFile(`/workspace/starlight/src/content/docs/${file.path}`, b64, {
                encoding: "base64",
              });
            }),
          );
        }

        log.info("publish.sandbox_files_written", { fileCount: files.length });

        const result = await sandbox.exec("cd /workspace/starlight && bun --bun run build-docs");

        if (!result.success) {
          log.error("publish.sandbox_build_failed", {
            exitCode: result.exitCode,
            stderr: result.stderr,
          });
          throw new Error(`Sandbox build failed: ${result.stderr}`);
        }

        log.info("publish.sandbox_build_complete", {
          buildLogs: result.stderr,
          exitCode: result.exitCode,
        });

        const { files: distFiles } = JSON.parse(result.stdout) as {
          files: { path: string; content: string }[];
        };

        log.info("publish.dist_collected", { distFileCount: distFiles.length });
        return distFiles;
      } finally {
        await sandbox.destroy();
      }
    });

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
  }
}
