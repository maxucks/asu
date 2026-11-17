import { ok } from "@/core/hono_response"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { DrizzleCaseDataSource } from "@/core/data_sources/case_data_source_drizzle"
import { DrizzleLanguageDataSource } from "@/core/data_sources/language_data_source_drizzle"
import { DrizzleStudyRecordDataSource } from "@/core/data_sources/study_record_data_source_drizzle"
import { databasePath } from "@/core/db"
import { log } from "@/core/logger"
import { PracticeRepository } from "@/practice/practice_repository"
import { createPracticeRoutes } from "@/practice/practice_routes"

const repository = new PracticeRepository(
  new DrizzleStudyRecordDataSource(),
  new DrizzleCaseDataSource(),
  new DrizzleLanguageDataSource(),
)

function corsOrigins(): string[] {
  const fromEnv = process.env.CORS_ORIGINS?.trim()
  if (fromEnv) {
    return fromEnv.split(",").map((origin) => origin.trim()).filter((origin) => origin.length > 0)
  }
  return ["http://localhost:3000", "http://127.0.0.1:3000"]
}

const app = new Hono()

app.use(
  "*",
  cors({
    origin: corsOrigins(),
  }),
)

app.get("/health", (c) => ok(c, { status: "ok" }))

app.route("/api/practice", createPracticeRoutes(repository))

const port = Number(process.env.PORT ?? 3001)
const hostname = process.env.HOST ?? "127.0.0.1"

log.info("server starting", { hostname, port, database: databasePath() })

const server = Bun.serve({
  hostname,
  port,
  fetch: app.fetch,
})

process.once("SIGTERM", () => {
  server.stop(true)
})

process.once("SIGINT", () => {
  server.stop(true)
  process.exit(0)
})
