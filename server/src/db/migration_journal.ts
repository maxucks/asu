import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import type { Database } from "bun:sqlite"
import { log } from "@/core/logger"
import { baselineSchemaPresent, studyRecordsMatchesV101 } from "@/db/schema_upgrades"

type JournalEntry = {
  readonly tag: string
  readonly when: number
}

type JournalFile = {
  readonly entries: readonly JournalEntry[]
}

function ensureMigrationsTable(sqlite: Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash text NOT NULL,
      created_at numeric
    )
  `)
}

function migrationFileHash(migrationsFolder: string, tag: string): string {
  const query = readFileSync(`${migrationsFolder}/${tag}.sql`, "utf8")
  return createHash("sha256").update(query).digest("hex")
}

function hasMigrationHash(sqlite: Database, hash: string): boolean {
  const row = sqlite.prepare("SELECT 1 FROM __drizzle_migrations WHERE hash = ? LIMIT 1").get(hash)
  return row !== undefined && row !== null
}

function migrationAlreadyApplied(sqlite: Database, tag: string): boolean {
  if (tag === "0000_init") {
    return baselineSchemaPresent(sqlite)
  }
  if (tag === "0001_1_0_1") {
    return studyRecordsMatchesV101(sqlite)
  }
  return false
}

/**
 * After db:push or an old migration history, the DB schema may already match a
 * journal entry that was never recorded in __drizzle_migrations — stamp those rows so
 * drizzle migrate does not re-run destructive/already-applied ALTERs.
 */
export function reconcileMigrationJournal(sqlite: Database, migrationsFolder: string) {
  ensureMigrationsTable(sqlite)
  const journal = JSON.parse(
    readFileSync(`${migrationsFolder}/meta/_journal.json`, "utf8"),
  ) as JournalFile

  const insert = sqlite.prepare(
    "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
  )

  for (const entry of journal.entries) {
    const hash = migrationFileHash(migrationsFolder, entry.tag)
    if (hasMigrationHash(sqlite, hash)) continue
    if (!migrationAlreadyApplied(sqlite, entry.tag)) continue

    insert.run(hash, entry.when)
    log.info("reconciled migration journal (schema already matches)", { tag: entry.tag })
  }
}