import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { Database } from "bun:sqlite"
import { databasePath } from "@/core/db"
import { log } from "@/core/logger"

const sqlPath = fileURLToPath(new URL("../../drizzle/0000_init.sql", import.meta.url))
const sql = readFileSync(sqlPath, "utf8")

const databaseUrl = databasePath()
const sqlite = new Database(databaseUrl)

sqlite.exec("PRAGMA foreign_keys = ON")
sqlite.exec(sql)
applyCasesTableMigrations(sqlite)
applyLanguagesTableMigrations(sqlite)
applyAssociationsTableMigrations(sqlite)
applyStudyRecordsTableMigrations(sqlite)
applyCategoriesTableMigrations(sqlite)
applyRepresentationTablesMigrations(sqlite)
sqlite.close()

log.info("schema applied", { database: databaseUrl })

type SqliteTableColumn = {
  readonly name: string
}

function applyCasesTableMigrations(sqlite: Database) {
  const tableExists = sqlite
    .prepare(
      "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'cases' LIMIT 1",
    )
    .get()

  if (!tableExists) {
    return
  }

  let columns = sqlite.prepare("PRAGMA table_info(cases)").all() as SqliteTableColumn[]
  let columnNames = new Set(columns.map((column) => column.name))

  if (columnNames.has("translation") && !columnNames.has("meaning")) {
    sqlite.exec("ALTER TABLE cases RENAME COLUMN translation TO meaning")
    log.info("migrated cases.translation to cases.meaning")
    columns = sqlite.prepare("PRAGMA table_info(cases)").all() as SqliteTableColumn[]
    columnNames = new Set(columns.map((column) => column.name))
  }

  if (!columnNames.has("meaning")) {
    sqlite.exec("ALTER TABLE cases ADD COLUMN meaning text")
    log.info("added cases.meaning column")
    columnNames.add("meaning")
  }

  if (columnNames.has("lemma_text") && !columnNames.has("value")) {
    sqlite.exec("ALTER TABLE cases RENAME COLUMN lemma_text TO value")
    log.info("migrated cases.lemma_text to cases.value")
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

function applyStudyRecordsTableMigrations(sqlite: Database) {
  const tableExists = sqlite
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'study_records' LIMIT 1")
    .get()

  if (!tableExists) return

  const columns = sqlite.prepare("PRAGMA table_info(study_records)").all() as SqliteTableColumn[]
  const columnNames = new Set(columns.map((column) => column.name))

  if (!columnNames.has("scheduling_strength_numeric")) {
    sqlite.exec("ALTER TABLE study_records ADD COLUMN scheduling_strength_numeric integer NOT NULL DEFAULT 0")
    log.info("added study_records.scheduling_strength_numeric column")
  }
  if (!columnNames.has("repetitions_count")) {
    sqlite.exec("ALTER TABLE study_records ADD COLUMN repetitions_count integer NOT NULL DEFAULT 0")
    log.info("added study_records.repetitions_count column")
  }
  if (!columnNames.has("last_repetition_at")) {
    sqlite.exec("ALTER TABLE study_records ADD COLUMN last_repetition_at text")
    log.info("added study_records.last_repetition_at column")
  }
  if (!columnNames.has("last_grade_numeric")) {
    sqlite.exec("ALTER TABLE study_records ADD COLUMN last_grade_numeric integer")
    log.info("added study_records.last_grade_numeric column")
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

function applyRepresentationTablesMigrations(sqlite: Database) {
  const typesExists = sqlite
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'representation_types' LIMIT 1")
    .get()

  if (!typesExists) {
    sqlite.exec(`
CREATE TABLE IF NOT EXISTS representation_types (
  id integer PRIMARY KEY NOT NULL,
  language_id text,
  name text NOT NULL,
  FOREIGN KEY (language_id) REFERENCES languages(id) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX IF NOT EXISTS representation_types_language_name_uq ON representation_types (language_id, name);
`)
    log.info("created representation_types table")
  }

  const caseRepsExists = sqlite
    .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'case_representations' LIMIT 1")
    .get()

  if (!caseRepsExists) {
    sqlite.exec(`
CREATE TABLE IF NOT EXISTS case_representations (
  id text PRIMARY KEY NOT NULL,
  case_id text NOT NULL,
  representation_type_id integer NOT NULL,
  value text NOT NULL,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (representation_type_id) REFERENCES representation_types(id) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX IF NOT EXISTS case_representations_case_type_uq ON case_representations (case_id, representation_type_id);
CREATE INDEX IF NOT EXISTS case_representations_case_id_idx ON case_representations (case_id);
`)
    log.info("created case_representations table")
  }

  sqlite.exec(`
INSERT OR IGNORE INTO representation_types (id, language_id, name) VALUES
  (1, NULL, 'transliteration'),
  (2, 'lang-japanese', 'romaji'),
  (3, 'lang-japanese', 'katakana'),
  (4, 'lang-japanese', 'hiragana');
`)
}
