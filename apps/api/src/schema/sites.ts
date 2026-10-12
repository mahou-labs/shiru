import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type { SiteSlug } from "../sites/names";
import type { SiteSource } from "../sites/source";
import { organizations } from "./auth";

export const sites = sqliteTable(
  "sites",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    slug: text("slug").$type<SiteSlug>().notNull().unique(),
    name: text("name").notNull(),
    source: text("source", { mode: "json" }).$type<SiteSource>().notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("sites_organizationId_idx").on(table.organizationId)],
);

export const hostnames = sqliteTable(
  "hostnames",
  {
    hostname: text("hostname").primaryKey(),
    siteId: text("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("hostnames_siteId_idx").on(table.siteId)],
);
