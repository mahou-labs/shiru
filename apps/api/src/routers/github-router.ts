import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import * as z from "zod";

import { docsSites } from "@/schema/docs";
import { db } from "@/utils/db";
import { log } from "@/utils/logger";
import { getInstallationOctokit } from "@/utils/oktokit";
import { protectedProcedure } from "@/utils/orpc";

export const githubRouter = {
  /** Returns the GitHub connection status for the current org's docs site */
  getConnection: protectedProcedure.handler(async ({ context: { session } }) => {
    if (!session.activeOrganizationId) {
      throw new ORPCError("Organization not found");
    }

    const [site] = await db
      .select({
        sourceMode: docsSites.sourceMode,
        githubOwner: docsSites.githubOwner,
        githubOwnerType: docsSites.githubOwnerType,
        githubRepository: docsSites.githubRepository,
        githubInstallationId: docsSites.githubInstallationId,
        publishableBranch: docsSites.publishableBranch,
        contentPath: docsSites.contentPath,
      })
      .from(docsSites)
      .where(eq(docsSites.organizationId, session.activeOrganizationId));

    if (!site) {
      return { connected: false as const };
    }

    return {
      connected: !!site.githubInstallationId,
      sourceMode: site.sourceMode,
      githubOwner: site.githubOwner,
      githubOwnerType: site.githubOwnerType,
      githubRepository: site.githubRepository,
      githubInstallationId: site.githubInstallationId,
      publishableBranch: site.publishableBranch,
      contentPath: site.contentPath,
    };
  }),

  /** Lists repositories accessible to the current GitHub App installation */
  listRepos: protectedProcedure.handler(async ({ context: { session } }) => {
    if (!session.activeOrganizationId) {
      throw new ORPCError("Organization not found");
    }

    const [site] = await db
      .select({ githubInstallationId: docsSites.githubInstallationId })
      .from(docsSites)
      .where(eq(docsSites.organizationId, session.activeOrganizationId));

    if (!site?.githubInstallationId) {
      throw new ORPCError("GitHub App not installed");
    }

    const octokit = getInstallationOctokit(Number(site.githubInstallationId));
    const { data } = await octokit.rest.apps.listReposAccessibleToInstallation({ per_page: 100 });

    return data.repositories.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      defaultBranch: repo.default_branch,
      private: repo.private,
    }));
  }),

  /** Sets which repository to use for docs */
  selectRepo: protectedProcedure
    .input(
      z.object({
        repository: z.string().min(1),
        branch: z.string().min(1).optional(),
        contentPath: z.string().optional(),
      }),
    )
    .handler(async ({ context: { session }, input }) => {
      if (!session.activeOrganizationId) {
        throw new ORPCError("Organization not found");
      }

      const [site] = await db
        .select({
          githubInstallationId: docsSites.githubInstallationId,
          githubOwner: docsSites.githubOwner,
        })
        .from(docsSites)
        .where(eq(docsSites.organizationId, session.activeOrganizationId));

      if (!site?.githubInstallationId) {
        throw new ORPCError("GitHub App not installed");
      }

      await db
        .update(docsSites)
        .set({
          githubRepository: input.repository,
          publishableBranch: input.branch ?? "main",
          contentPath: input.contentPath ?? "",
        })
        .where(eq(docsSites.organizationId, session.activeOrganizationId));

      log.info("github.repo_selected", {
        orgId: session.activeOrganizationId,
        repository: input.repository,
      });

      return { ok: true };
    }),
};
