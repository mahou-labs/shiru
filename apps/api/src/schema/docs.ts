import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import type { DocSlug, TargetLabel } from "../docs/names";
import type { DocSource } from "../docs/source";
import { organizations } from "./auth";

export const docs = sqliteTable(
  "docs",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    slug: text("slug").$type<DocSlug>().notNull().unique(),
    name: text("name").notNull(),
    visibility: text("visibility", { enum: ["public", "internal"] })
      .notNull()
      .default("public"),
    source: text("source", { mode: "json" }).$type<DocSource>().notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("docs_organizationId_idx").on(table.organizationId),
    uniqueIndex("docs_public_organizationId_idx")
      .on(table.organizationId)
      .where(sql`visibility = 'public'`),
  ],
);

export const hostnames = sqliteTable(
  "hostnames",
  {
    hostname: text("hostname").primaryKey(),
    docId: text("doc_id")
      .notNull()
      .references(() => docs.id, { onDelete: "cascade" }),
    // The Cloudflare for SaaS custom hostname. Null in development, which never calls Cloudflare.
    cloudflareId: text("cloudflare_id"),
    status: text("status", { enum: ["pending", "active", "failed", "removing"] })
      .notNull()
      .default("pending"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  // One custom domain per doc.
  (table) => [uniqueIndex("hostnames_docId_unique").on(table.docId)],
);

/** When each preview target was last requested, so a daily cron can retire forgotten ones. */
export const previews = sqliteTable(
  "previews",
  {
    docId: text("doc_id")
      .notNull()
      .references(() => docs.id, { onDelete: "cascade" }),
    label: text("label").$type<TargetLabel>().notNull(),
    requestedAt: integer("requested_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.docId, table.label] }),
    index("previews_requestedAt_idx").on(table.requestedAt),
  ],
);
