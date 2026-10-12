import { env } from "cloudflare:workers";
import { and, asc, eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";

import { sites } from "../schema/sites";
import { SiteSlug } from "../sites/names";
import { db } from "../utils/db";
import { organizationProcedure, paidProcedure } from "../utils/orpc";

function withUrl<T extends { slug: string }>(site: T) {
  return { ...site, url: `https://${site.slug}.${env.DOCS_DOMAIN}` };
}

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
};
