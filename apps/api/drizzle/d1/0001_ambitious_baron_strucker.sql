CREATE TABLE `__new_docs_sites` (
	`id` text PRIMARY KEY,
	`organization_id` text NOT NULL,
	`storage_prefix` text NOT NULL,
	`active_commit_sha` text,
	`source_mode` text DEFAULT 'managed' NOT NULL,
	`publishable_branch` text DEFAULT 'main' NOT NULL,
	`content_path` text DEFAULT '' NOT NULL,
	`github_owner` text,
	`github_owner_type` text,
	`github_repository` text,
	`github_installation_id` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT `fk_docs_sites_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_docs_sites` (
	`id`,
	`organization_id`,
	`storage_prefix`,
	`active_commit_sha`,
	`source_mode`,
	`publishable_branch`,
	`content_path`,
	`github_owner`,
	`github_owner_type`,
	`github_repository`,
	`github_installation_id`,
	`created_at`,
	`updated_at`
)
SELECT
	`docs_sites`.`id`,
	`docs_sites`.`organization_id`,
	`organizations`.`slug`,
	`docs_sites`.`active_commit_sha`,
	`docs_sites`.`source_mode`,
	`docs_sites`.`publishable_branch`,
	`docs_sites`.`content_path`,
	`docs_sites`.`github_owner`,
	`docs_sites`.`github_owner_type`,
	`docs_sites`.`github_repository`,
	`docs_sites`.`github_installation_id`,
	`docs_sites`.`created_at`,
	`docs_sites`.`updated_at`
FROM `docs_sites`
JOIN `organizations` ON `organizations`.`id` = `docs_sites`.`organization_id`;
--> statement-breakpoint
DROP TABLE `docs_sites`;
--> statement-breakpoint
ALTER TABLE `__new_docs_sites` RENAME TO `docs_sites`;
--> statement-breakpoint
CREATE UNIQUE INDEX `docs_sites_organizationId_uidx` ON `docs_sites` (`organization_id`);
