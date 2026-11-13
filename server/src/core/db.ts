import { mkdirSync } from "node:fs"
import { dirname, isAbsolute, join, resolve } from "node:path"
import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import * as schema from "@/db/schema"

const serverPackageRoot = resolve(import.meta.dir, "../..")
const defaultDatabasePath = join(serverPackageRoot, "data", "asu.sqlite")
const databaseUrl = process.env.DATABASE_URL
  ? isAbsolute(process.env.DATABASE_URL)
    ? process.env.DATABASE_URL
    : join(serverPackageRoot, process.env.DATABASE_URL)
  : defaultDatabasePath

mkdirSync(dirname(databaseUrl), { recursive: true })

const sqlite = new Database(databaseUrl)

sqlite.exec("PRAGMA foreign_keys = ON")

export const db = drizzle(sqlite, { schema })

export function databasePath(): string {
  return databaseUrl
}
