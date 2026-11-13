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
