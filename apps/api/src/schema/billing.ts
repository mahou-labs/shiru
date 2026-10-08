import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { organizations } from "./auth";

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    currentPeriodEnd: integer("current_period_end", { mode: "timestamp_ms" }).notNull(),
    polarModifiedAt: integer("polar_modified_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("subscriptions_organizationId_idx").on(table.organizationId)],
);
