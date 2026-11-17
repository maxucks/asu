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
