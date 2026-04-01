import { ORPCError } from "@orpc/server";
import { WorkflowEntrypoint, WorkflowStep, type WorkflowEvent, env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import z from "zod";

import { organizations } from "@/schema/auth";
import { docsSites, docsVersions } from "@/schema/docs";
import { db } from "@/utils/db";
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
      // 1. get files from github, move them to r2
      // 2. trigger sandbox for building the app
      // 3. success

      if (!session.activeOrganizationId) {
        throw new ORPCError("Organization not found");
      }

      const instanceId = uuidv7();
      const instance = await env.PUBLISH_DOCS.create({
        id: instanceId,
        params: {
          docsSiteId: input.docsSiteId,
          organizationId: session.activeOrganizationId,
          instanceId,
        },
      });

      console.log({ instance });

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
        throw new Error("Docs site or organization not found");
      }

      return { docsSite: site, slug: org.slug };
    });

    console.log({ docsSite, slug });

    const { files, commitSha } = await step.do("fetch-github-files", async () => {
      const result = await getGithubFiles(docsSite);
      if (!result) {
        throw new Error("No files found");
      }
      return result;
    });

    console.log({ files, commitSha });
    console.log(`-- ${event.payload.instanceId} --`);

    const debug = await step.do("save-version", async () => {
      const { data, error } = await tryCatch(
        db.insert(docsVersions).values({
          docsSiteId: event.payload.docsSiteId,
          workflowInstanceId: event.payload.instanceId,
          versionRef: commitSha,
        }),
      );

      console.log({ data, error });
    });

    console.log({ debug });

    await step.do("upload-to-r2", async () => {
      await Promise.all(
        files.map((file) => env.DOCS_SOURCE.put(`${slug}/${file.path}`, file.content)),
      );
    });
  }
}
