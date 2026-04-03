import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { v7 as uuidv7 } from "uuid";

import { organizations, users } from "./auth";

export const docsSites = sqliteTable(
  "docs_sites",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    organizationId: text("organization_id")
      .notNull()
      .unique()
      .references(() => organizations.id, { onDelete: "cascade" }),
    activeCommitSha: text("active_commit_sha"),
    sourceMode: text("source_mode", { enum: ["managed", "github"] })
      .notNull()
      .default("managed"),
    publishableBranch: text("publishable_branch").notNull().default("main"),
    contentPath: text("content_path").notNull().default(""),
    githubOwner: text("github_owner"),
    githubOwnerType: text("github_owner_type", { enum: ["User", "Organization"] }),
    githubRepository: text("github_repository"),
    githubInstallationId: integer("github_installation_id", { mode: "number" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("docs_sites_organizationId_uidx").on(table.organizationId)],
);

export const docsVersions = sqliteTable(
  "docs_versions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    docsSiteId: text("docs_site_id")
      .notNull()
      .references(() => docsSites.id, { onDelete: "cascade" }),
    versionRef: text("version_ref").notNull(),
    status: text("status", { enum: ["building", "published", "failed"] })
      .notNull()
      .default("building"),
    workflowInstanceId: text("workflow_instance_id").notNull(),
    requestedByUserId: text("requested_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("docs_versions_site_versionRef_uidx").on(table.docsSiteId, table.versionRef),
  ],
);
