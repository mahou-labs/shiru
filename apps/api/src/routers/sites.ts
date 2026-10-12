import { asc, eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";

import { sites } from "../schema/sites";
import { SiteSlug } from "../sites/names";
import { db } from "../utils/db";
import { organizationProcedure, paidProcedure } from "../utils/orpc";

export const sitesRouter = {
  create: paidProcedure
    .errors({ SLUG_TAKEN: { status: 409, message: "Another site already uses this address" } })
    .input(z.object({ slug: SiteSlug, name: z.string().trim().min(1).max(100) }))
    .handler(async ({ context, input, errors }) => {
      const id = uuidv7();
      const [site] = await db
        .insert(sites)
        .values({
          id,
          organizationId: context.organizationId,
          slug: input.slug,
          name: input.name,
          // Keyed by id, not slug, so renaming a site never moves its repo.
          source: { kind: "managed", artifactsRepo: id },
          createdAt: new Date(),
        })
        .onConflictDoNothing({ target: sites.slug })
        .returning();
      if (!site) throw errors.SLUG_TAKEN();
      return site;
    }),
  list: organizationProcedure.handler(({ context }) =>
    db
      .select()
      .from(sites)
      .where(eq(sites.organizationId, context.organizationId))
      .orderBy(asc(sites.createdAt), asc(sites.id)),
  ),
};
