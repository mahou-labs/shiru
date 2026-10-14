CREATE TABLE `rate_limits` (
	`id` text PRIMARY KEY,
	`key` text NOT NULL UNIQUE,
	`count` integer NOT NULL,
	`last_request` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `docs` (
	`id` text PRIMARY KEY,
	`organization_id` text NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`name` text NOT NULL,
	`visibility` text DEFAULT 'public' NOT NULL,
	`source` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_docs_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `hostnames` (
	`hostname` text PRIMARY KEY,
	`doc_id` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_hostnames_doc_id_docs_id_fk` FOREIGN KEY (`doc_id`) REFERENCES `docs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `docs_organizationId_idx` ON `docs` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `docs_public_organizationId_idx` ON `docs` (`organization_id`) WHERE visibility = 'public';--> statement-breakpoint
CREATE INDEX `hostnames_docId_idx` ON `hostnames` (`doc_id`);