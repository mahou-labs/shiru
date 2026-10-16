CREATE TABLE `previews` (
	`doc_id` text NOT NULL,
	`label` text NOT NULL,
	`requested_at` integer NOT NULL,
	CONSTRAINT `previews_pk` PRIMARY KEY(`doc_id`, `label`),
	CONSTRAINT `fk_previews_doc_id_docs_id_fk` FOREIGN KEY (`doc_id`) REFERENCES `docs`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `previews_requestedAt_idx` ON `previews` (`requested_at`);