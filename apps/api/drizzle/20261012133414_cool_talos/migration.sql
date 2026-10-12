CREATE TABLE `hostnames` (
	`hostname` text PRIMARY KEY,
	`site_id` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_hostnames_site_id_sites_id_fk` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `sites` (
	`id` text PRIMARY KEY,
	`organization_id` text NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`name` text NOT NULL,
	`source` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_sites_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `hostnames_siteId_idx` ON `hostnames` (`site_id`);--> statement-breakpoint
CREATE INDEX `sites_organizationId_idx` ON `sites` (`organization_id`);