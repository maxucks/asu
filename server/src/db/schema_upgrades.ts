import type { Database } from "bun:sqlite"
import { log } from "@/core/logger"

type SqliteTableColumn = {
  readonly name: string
}

function applyCasesTableMigrations(sqlite: Database) {
  const tableExists = sqlite
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'cases' LIMIT 1")
    .get()

  if (!tableExists) {
    return
  }

  const columns = sqlite.prepare("PRAGMA table_info(cases)").all() as SqliteTableColumn[]
  const columnNames = new Set(columns.map((column) => column.name))

  if (columnNames.has("translation") && !columnNames.has("meaning")) {
    sqlite.exec("ALTER TABLE cases RENAME COLUMN translation TO meaning")
    log.info("migrated cases.translation to cases.meaning")
    return
  }

  if (!columnNames.has("meaning")) {
    sqlite.exec("ALTER TABLE cases ADD COLUMN meaning text")
    log.info("added cases.meaning column")
  }
}

function applyLanguagesTableMigrations(sqlite: Database) {
  const tableExists = sqlite
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'languages' LIMIT 1")
    .get()

  if (!tableExists) return

  const columns = sqlite.prepare("PRAGMA table_info(languages)").all() as SqliteTableColumn[]
  const columnNames = new Set(columns.map((column) => column.name))

  if (!columnNames.has("icon")) {
    sqlite.exec("ALTER TABLE `languages` ADD COLUMN `icon` text DEFAULT '🌐' NOT NULL;")
    log.info("added languages.icon column")
  }
}

function applyAssociationsTableMigrations(sqlite: Database) {
  const tableExists = sqlite
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'associations' LIMIT 1")
    .get()

  if (!tableExists) return

  const columns = sqlite.prepare("PRAGMA table_info(associations)").all() as SqliteTableColumn[]
  const columnNames = new Set(columns.map((column) => column.name))

  if (!columnNames.has("tile_color")) {
    sqlite.exec("ALTER TABLE associations ADD COLUMN tile_color text")
    log.info("added associations.tile_color column")
  }
}

function dropStudyRecordColumnIfPresent(sqlite: Database, columnNames: Set<string>, name: string) {
  if (!columnNames.has(name)) return
  sqlite.exec(`ALTER TABLE study_records DROP COLUMN ${name}`)
  log.info(`dropped study_records.${name} column`)
  columnNames.delete(name)
}

export function applyStudyRecordsTableMigrations(sqlite: Database) {
  const tableExists = sqlite
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'study_records' LIMIT 1")
    .get()

  if (!tableExists) return

  let columns = sqlite.prepare("PRAGMA table_info(study_records)").all() as SqliteTableColumn[]
  let columnNames = new Set(columns.map((column) => column.name))

  if (!columnNames.has("level_numeric")) {
    sqlite.exec("ALTER TABLE study_records ADD COLUMN level_numeric integer NOT NULL DEFAULT 0")
    log.info("added study_records.level_numeric column")
  }
  if (!columnNames.has("points_numeric")) {
    sqlite.exec("ALTER TABLE study_records ADD COLUMN points_numeric integer NOT NULL DEFAULT 0")
    log.info("added study_records.points_numeric column")
  }
  if (!columnNames.has("study_mode")) {
    sqlite.exec("ALTER TABLE study_records ADD COLUMN study_mode text NOT NULL DEFAULT 'normal'")
    log.info("added study_records.study_mode column")
  }

  columns = sqlite.prepare("PRAGMA table_info(study_records)").all() as SqliteTableColumn[]
  columnNames = new Set(columns.map((column) => column.name))

  if (columnNames.has("exp_locked_until") && !columnNames.has("locked_until")) {
    sqlite.exec("ALTER TABLE study_records RENAME COLUMN exp_locked_until TO locked_until")
    log.info("renamed study_records.exp_locked_until to locked_until")
    columnNames.delete("exp_locked_until")
    columnNames.add("locked_until")
  }
  if (!columnNames.has("locked_until")) {
    sqlite.exec("ALTER TABLE study_records ADD COLUMN locked_until text")
    log.info("added study_records.locked_until column")
  }
  if (!columnNames.has("mode_until")) {
    sqlite.exec("ALTER TABLE study_records ADD COLUMN mode_until text")
    log.info("added study_records.mode_until column")
  }
  if (!columnNames.has("streak_count")) {
    sqlite.exec("ALTER TABLE study_records ADD COLUMN streak_count integer NOT NULL DEFAULT 0")
    if (columnNames.has("berserk_streak_signed")) {
      sqlite.exec(
        "UPDATE study_records SET streak_count = berserk_streak_signed WHERE streak_count = 0 AND berserk_streak_signed IS NOT NULL",
      )
    }
    log.info("added study_records.streak_count column")
  }

  columns = sqlite.prepare("PRAGMA table_info(study_records)").all() as SqliteTableColumn[]
  columnNames = new Set(columns.map((column) => column.name))

  for (const legacy of [
    "know_wrong_streak",
    "learning_cycle_key",
    "berserk_streak_signed",
    "freeze_used_in_cycle",
    "review_status",
    "due_at",
    "scheduling_strength_numeric",
    "repetitions_count",
    "last_repetition_at",
    "last_grade_numeric",
    "exp_locked_until",
  ]) {
    dropStudyRecordColumnIfPresent(sqlite, columnNames, legacy)
  }
}

function applyCategoriesTableMigrations(sqlite: Database) {
  const categoriesExists = sqlite
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'categories' LIMIT 1")
    .get()

  if (!categoriesExists) {
    sqlite.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY NOT NULL,
  language_id text NOT NULL,
  name text NOT NULL,
  FOREIGN KEY (language_id) REFERENCES languages(id) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX IF NOT EXISTS categories_language_name_uq ON categories (language_id, name);
CREATE INDEX IF NOT EXISTS categories_language_id_idx ON categories (language_id);
`)
    log.info("created categories table")
  }

  const junctionExists = sqlite
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'case_categories' LIMIT 1")
    .get()

  if (!junctionExists) {
    sqlite.exec(`
CREATE TABLE IF NOT EXISTS case_categories (
  case_id text NOT NULL,
  category_id text NOT NULL,
  PRIMARY KEY(case_id, category_id),
  FOREIGN KEY (case_id) REFERENCES cases(id) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX IF NOT EXISTS case_categories_case_id_idx ON case_categories (case_id);
CREATE INDEX IF NOT EXISTS case_categories_category_id_idx ON case_categories (category_id);
`)
    log.info("created case_categories table")
  }
}

/** Idempotent column/table upgrades for existing SQLite files (safe to run before db:migrate). */
export function applyIdempotentSchemaUpgrades(sqlite: Database) {
  applyCasesTableMigrations(sqlite)
  applyLanguagesTableMigrations(sqlite)
  applyAssociationsTableMigrations(sqlite)
  applyStudyRecordsTableMigrations(sqlite)
  applyCategoriesTableMigrations(sqlite)
}

const STUDY_RECORD_V101_COLUMNS = [
  "level_numeric",
  "points_numeric",
  "study_mode",
  "locked_until",
  "mode_until",
  "streak_count",
] as const

const STUDY_RECORD_LEGACY_COLUMNS = ["review_status", "due_at"] as const

export function studyRecordsMatchesV101(sqlite: Database): boolean {
  const tableExists = sqlite
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'study_records' LIMIT 1")
    .get()
  if (!tableExists) return false

  const columns = sqlite.prepare("PRAGMA table_info(study_records)").all() as SqliteTableColumn[]
  const names = new Set(columns.map((column) => column.name))
  return (
    STUDY_RECORD_V101_COLUMNS.every((name) => names.has(name)) &&
    STUDY_RECORD_LEGACY_COLUMNS.every((name) => !names.has(name))
  )
}

export function baselineSchemaPresent(sqlite: Database): boolean {
  return Boolean(
    sqlite
      .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='languages' LIMIT 1")
      .get(),
  )
}