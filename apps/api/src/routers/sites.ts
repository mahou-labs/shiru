import { env } from "cloudflare:workers";
import { and, asc, eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";

import { sites } from "../schema/sites";
import { SitePath } from "../sites/drafts";
import { SiteSlug } from "../sites/names";
import type { SiteDO } from "../sites/site-do";
import { db } from "../utils/db";
import { organizationProcedure, paidProcedure } from "../utils/orpc";

/**
 * Where a site is served, for the dashboard's links and for the build's canonical URLs. In
 * development the dispatch Worker serves `<slug>.docs.localhost` on port 3003.
 */
export function siteUrl(slug: string) {
  return env.ENVIRONMENT === "development"
    ? `http://${slug}.${env.DOCS_DOMAIN}:3003`
    : `https://${slug}.${env.DOCS_DOMAIN}`;
}

function withUrl<T extends { slug: string }>(site: T) {
  return { ...site, url: siteUrl(site.slug) };
}

const SITE_ERRORS = { NOT_FOUND: { status: 404, message: "Site not found" } } as const;
const FILE_ERRORS = { FILE_NOT_FOUND: { status: 404, message: "File not found" } } as const;

const siteInput = z.object({ siteId: z.string() });
const fileInput = siteInput.extend({ path: SitePath });

// The binding names this Worker by string, so cf/config cannot infer the class.
const siteObjects = () => env.SITE_DO as DurableObjectNamespace<SiteDO>;

/** The site's SiteDO, or null when the organization has no such site. */
async function openSite(organizationId: string, siteId: string) {
  const [site] = await db
    .select()
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.organizationId, organizationId)));
  // Connected GitHub sources have no editor yet.
  if (!site || site.source.kind !== "managed") return null;
  const stub = siteObjects().getByName(site.id);
  await stub.init({
    siteId: site.id,
    name: site.name,
    repo: site.source.artifactsRepo,
    siteUrl: siteUrl(site.slug),
  });
  return stub;
}

const author = (user: { name: string; email: string }) => ({ name: user.name, email: user.email });

/** Editing a managed site's files. Paths are relative to the site's docs root. */
const filesRouter = {
  /** Every file with its draft state: unchanged, added, modified or deleted. */
  tree: organizationProcedure
    .errors(SITE_ERRORS)
    .input(siteInput)
    .handler(async ({ context, input, errors }) => {
      const site = await openSite(context.organizationId, input.siteId);
      if (!site) throw errors.NOT_FOUND();
      return { files: await site.getTree() };
    }),
  /** A file's text: the draft if there is one, otherwise the published version. */
  get: organizationProcedure
    .errors({
      ...SITE_ERRORS,
      ...FILE_ERRORS,
      NOT_TEXT: { status: 415, message: "This file is not text" },
    })
    .input(fileInput)
    .handler(async ({ context, input, errors }) => {
      const site = await openSite(context.organizationId, input.siteId);
      if (!site) throw errors.NOT_FOUND();
      const file = await site.getFile(input.path);
      if (file.kind === "not_found") throw errors.FILE_NOT_FOUND();
      try {
        return {
          path: input.path,
          content: new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(file.content),
        };
      } catch {
        throw errors.NOT_TEXT();
      }
    }),
  /** Saves a draft. Nothing reaches the site until `sites.publish`. */
  save: paidProcedure
    .errors(SITE_ERRORS)
    .input(fileInput.extend({ content: z.string().max(1_000_000) }))
    .handler(async ({ context, input, errors }) => {
      const site = await openSite(context.organizationId, input.siteId);
      if (!site) throw errors.NOT_FOUND();
      const content = new TextEncoder().encode(input.content);
      return site.saveDraft(input.path, content, author(context.user));
    }),
  /** Records a delete draft, or drops the draft of a file that was never published. */
  delete: paidProcedure
    .errors({ ...SITE_ERRORS, ...FILE_ERRORS })
    .input(fileInput)
    .handler(async ({ context, input, errors }) => {
      const site = await openSite(context.organizationId, input.siteId);
      if (!site) throw errors.NOT_FOUND();
      const outcome = await site.deleteFile(input.path, author(context.user));
      if (outcome.kind === "not_found") throw errors.FILE_NOT_FOUND();
      return { path: input.path, deleted: true as const };
    }),
  /** Throws away a file's draft, back to the published version. */
  discard: paidProcedure
    .errors({ ...SITE_ERRORS, ...FILE_ERRORS })
    .input(fileInput)
    .handler(async ({ context, input, errors }) => {
      const site = await openSite(context.organizationId, input.siteId);
      if (!site) throw errors.NOT_FOUND();
      const outcome = await site.discardDraft(input.path);
      if (outcome.kind === "not_found") throw errors.FILE_NOT_FOUND();
      return { path: input.path, discarded: true as const };
    }),
};

export const sitesRouter = {
  create: paidProcedure
    .errors({
      SLUG_TAKEN: { status: 409, message: "Another site already uses this address" },
      PUBLIC_SITE_EXISTS: {
        status: 409,
        message: "This organization already has a public docs site",
      },
    })
    .input(
      z.object({
        slug: SiteSlug,
        name: z.string().trim().min(1).max(100),
        visibility: z.literal("public"),
      }),
    )
    .handler(async ({ context, input, errors }) => {
      const id = uuidv7();
      const [site] = await db
        .insert(sites)
        .values({
          id,
          organizationId: context.organizationId,
          slug: input.slug,
          name: input.name,
          visibility: input.visibility,
          // Keyed by id, not slug, so renaming a site never moves its repo.
          source: { kind: "managed", artifactsRepo: id },
          createdAt: new Date(),
        })
        .onConflictDoNothing()
        .returning();
      if (site) return withUrl(site);

      // The insert skips any unique conflict, so read back which one it hit. A public site wins
      // because no other address would fix it.
      const [publicSite] = await db
        .select({ id: sites.id })
        .from(sites)
        .where(
          and(eq(sites.organizationId, context.organizationId), eq(sites.visibility, "public")),
        );
      throw publicSite ? errors.PUBLIC_SITE_EXISTS() : errors.SLUG_TAKEN();
    }),
  list: organizationProcedure.handler(async ({ context }) => {
    const rows = await db
      .select()
      .from(sites)
      .where(eq(sites.organizationId, context.organizationId))
      .orderBy(asc(sites.createdAt), asc(sites.id));
    return rows.map(withUrl);
  }),
  checkSlug: organizationProcedure
    .input(z.object({ slug: SiteSlug }))
    .handler(async ({ input }) => {
      const [taken] = await db
        .select({ id: sites.id })
        .from(sites)
        .where(eq(sites.slug, input.slug));
      return { available: !taken };
    }),
  docsDomain: organizationProcedure.handler(() => env.DOCS_DOMAIN),
  files: filesRouter,
  /**
   * Commits every draft not in conflict and builds the commit on the live target. Conflicted
   * drafts stay and come back in `skipped`. `unchanged` means there was nothing to commit.
   */
  publish: paidProcedure
    .errors({
      ...SITE_ERRORS,
      CONFLICT: { status: 409, message: "The site kept changing while publishing. Try again." },
    })
    .input(siteInput)
    .handler(async ({ context, input, errors }) => {
      const site = await openSite(context.organizationId, input.siteId);
      if (!site) throw errors.NOT_FOUND();
      const result = await site.publish(author(context.user));
      if (result.kind === "conflict") throw errors.CONFLICT();
      return result;
    }),
  /** Head commit, per-target build state and unpublished drafts. */
  status: organizationProcedure
    .errors(SITE_ERRORS)
    .input(siteInput)
    .handler(async ({ context, input, errors }) => {
      const site = await openSite(context.organizationId, input.siteId);
      if (!site) throw errors.NOT_FOUND();
      return site.status();
    }),
};
