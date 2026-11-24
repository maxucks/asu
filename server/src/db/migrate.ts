import { fileURLToPath } from "node:url"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"
import { db, databasePath } from "@/core/db"
import { log } from "@/core/logger"

const migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url))

log.info("running migrations", { database: databasePath(), migrationsFolder })

await migrate(db, { migrationsFolder })

log.info("migrations complete")
