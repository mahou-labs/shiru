CREATE TABLE `custom_domains` (
	`id` text PRIMARY KEY,
	`organization_id` text NOT NULL,
	`hostname` text NOT NULL,
	`cloudflare_hostname_id` text,
	`status` text DEFAULT 'pending_verification' NOT NULL,
	`verification_txt_name` text,
	`verification_txt_value` text,
	`verification_cname_target` text,
	`ssl_status` text DEFAULT 'pending',
	`ssl_validation_txt_name` text,
	`ssl_validation_txt_value` text,
	`error_message` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT `fk_custom_domains_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE UNIQUE INDEX `custom_domains_org_uidx` ON `custom_domains` (`organization_id`);--> statement-breakpoint
CREATE INDEX `custom_domains_hostname_idx` ON `custom_domains` (`hostname`);