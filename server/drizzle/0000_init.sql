CREATE TABLE IF NOT EXISTS `languages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);

CREATE TABLE IF NOT EXISTS `cases` (
	`id` text PRIMARY KEY NOT NULL,
	`language_id` text NOT NULL,
	`lemma_text` text NOT NULL,
	`meaning` text,
	FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS `cases_language_id_idx` ON `cases` (`language_id`);

CREATE TABLE IF NOT EXISTS `associations` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`kind` text NOT NULL,
	`content_ref` text NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` text NOT NULL,
	`hidden_from_practice` integer NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS `associations_case_id_idx` ON `associations` (`case_id`);

CREATE TABLE IF NOT EXISTS `study_records` (
	`case_id` text PRIMARY KEY NOT NULL,
	`review_status` text NOT NULL,
	`due_at` text,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE cascade
);
