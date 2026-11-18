import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { Database } from "bun:sqlite"
import { databasePath } from "@/core/db"
import { log } from "@/core/logger"
import { applyIdempotentSchemaUpgrades } from "@/db/schema_upgrades"

const sqlPath = fileURLToPath(new URL("../../drizzle/0000_init.sql", import.meta.url))
const sql = readFileSync(sqlPath, "utf8")

const databaseUrl = databasePath()
const sqlite = new Database(databaseUrl)

sqlite.exec("PRAGMA foreign_keys = ON")
sqlite.exec(sql)
applyIdempotentSchemaUpgrades(sqlite)
sqlite.close()

log.info("schema applied", { database: databaseUrl })