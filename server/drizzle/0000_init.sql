CREATE TABLE IF NOT EXISTS `languages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text DEFAULT '🌐' NOT NULL
);

CREATE TABLE IF NOT EXISTS `cases` (
	`id` text PRIMARY KEY NOT NULL,
	`language_id` text NOT NULL,
	`value` text NOT NULL,
	`meaning` text,
	FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS `cases_language_id_idx` ON `cases` (`language_id`);

CREATE TABLE IF NOT EXISTS `associations` (
	`id` text PRIMARY KEY NOT NULL,
	`case_id` text NOT NULL,
	`kind` text NOT NULL,
	`content_ref` text NOT NULL,
	`tile_color` text,
	`sort_order` integer NOT NULL,
	`created_at` text NOT NULL,
	`hidden_from_practice` integer NOT NULL,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS `associations_case_id_idx` ON `associations` (`case_id`);

CREATE TABLE IF NOT EXISTS `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`language_id` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX IF NOT EXISTS `categories_language_name_uq` ON `categories` (`language_id`,`name`);
CREATE INDEX IF NOT EXISTS `categories_language_id_idx` ON `categories` (`language_id`);

CREATE TABLE IF NOT EXISTS `case_categories` (
	`case_id` text NOT NULL,
	`category_id` text NOT NULL,
	PRIMARY KEY(`case_id`, `category_id`),
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS `case_categories_case_id_idx` ON `case_categories` (`case_id`);
CREATE INDEX IF NOT EXISTS `case_categories_category_id_idx` ON `case_categories` (`category_id`);

CREATE TABLE IF NOT EXISTS `study_records` (
	`case_id` text PRIMARY KEY NOT NULL,
	`review_status` text NOT NULL,
	`due_at` text,
	`scheduling_strength_numeric` integer DEFAULT 0 NOT NULL,
	`repetitions_count` integer DEFAULT 0 NOT NULL,
	`last_repetition_at` text,
	`last_grade_numeric` integer,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE cascade
);
