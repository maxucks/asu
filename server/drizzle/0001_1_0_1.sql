ALTER TABLE `study_records` ADD COLUMN `level_numeric` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `study_records` ADD COLUMN `points_numeric` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `study_records` ADD COLUMN `study_mode` text DEFAULT 'normal' NOT NULL;
--> statement-breakpoint
ALTER TABLE `study_records` ADD COLUMN `locked_until` text;
--> statement-breakpoint
ALTER TABLE `study_records` ADD COLUMN `mode_until` text;
--> statement-breakpoint
ALTER TABLE `study_records` ADD COLUMN `streak_count` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `study_records` DROP COLUMN `review_status`;
--> statement-breakpoint
ALTER TABLE `study_records` DROP COLUMN `due_at`;
--> statement-breakpoint
ALTER TABLE `study_records` DROP COLUMN `scheduling_strength_numeric`;
--> statement-breakpoint
ALTER TABLE `study_records` DROP COLUMN `repetitions_count`;
--> statement-breakpoint
ALTER TABLE `study_records` DROP COLUMN `last_repetition_at`;
--> statement-breakpoint
ALTER TABLE `study_records` DROP COLUMN `last_grade_numeric`;