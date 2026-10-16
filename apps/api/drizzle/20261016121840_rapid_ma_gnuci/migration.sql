ALTER TABLE `hostnames` ADD `cloudflare_id` text;--> statement-breakpoint
ALTER TABLE `hostnames` ADD `status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
DROP INDEX IF EXISTS `hostnames_docId_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `hostnames_docId_unique` ON `hostnames` (`doc_id`);