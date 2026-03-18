import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { v7 as uuidv7 } from "uuid";
import { organizations } from "./auth";

export const customDomains = sqliteTable(
  "custom_domains",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    hostname: text("hostname").notNull(),
    cloudflareHostnameId: text("cloudflare_hostname_id"),
    status: text("status", {
      enum: ["pending_verification", "active", "error"],
    })
      .notNull()
      .default("pending_verification"),
    verificationTxtName: text("verification_txt_name"),
    verificationTxtValue: text("verification_txt_value"),
    verificationCnameTarget: text("verification_cname_target"),
    sslStatus: text("ssl_status", {
      enum: ["pending", "active", "error"],
    }).default("pending"),
    sslValidationTxtName: text("ssl_validation_txt_name"),
    sslValidationTxtValue: text("ssl_validation_txt_value"),
    errorMessage: text("error_message"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("custom_domains_org_uidx").on(table.organizationId),
    index("custom_domains_hostname_idx").on(table.hostname),
  ],
);
