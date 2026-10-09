import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const waitlistEntries = sqliteTable("waitlist_entries", {
  email: text("email").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});
