import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { Database } from "bun:sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"
import { db, databasePath } from "@/core/db"
import { log } from "@/core/logger"
import { reconcileMigrationJournal } from "@/db/migration_journal"
import { applyIdempotentSchemaUpgrades } from "@/db/schema_upgrades"

const migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url))
const baselineSqlPath = fileURLToPath(new URL("../../drizzle/0000_init.sql", import.meta.url))

function prepareDatabaseForMigrate() {
  const path = databasePath()
  const sqlite = new Database(path)
  sqlite.exec("PRAGMA foreign_keys = ON")

  const hasCoreTable = sqlite
    .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='languages' LIMIT 1")
    .get()
  if (!hasCoreTable) {
    sqlite.exec(readFileSync(baselineSqlPath, "utf8"))
    log.info("applied baseline schema (0000_init.sql)")
  }

  applyIdempotentSchemaUpgrades(sqlite)
  reconcileMigrationJournal(sqlite, migrationsFolder)
  sqlite.close()
}

log.info("running migrations", { database: databasePath(), migrationsFolder })

prepareDatabaseForMigrate()
await migrate(db, { migrationsFolder })

log.info("migrations complete")