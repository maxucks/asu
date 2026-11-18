# ASU API server

Bun + Hono + SQLite (Drizzle). Same layer rules as `web_client`: routes → repository → data sources.

## Setup

```bash
cd server
cp .env.example .env
bun run db:setup
```

```bash
bun run dev
```

Loads `.env` from the server directory. If you change `PORT`, set `NEXT_PUBLIC_ASU_API_URL` in `web_client/.env.local` to match.

Default: `http://localhost:3001`

- `GET /health`
- `GET /api/practice/session?languageId=` — start infinite practice (weighted pick + `totalCases`)
- `GET /api/practice/next?languageId=&excludeCaseId=` — next card after a grade
- `GET /api/practice/queue` — legacy shim (first picked card only)
- `POST /api/practice/cases/:caseId/grade` — body `{ "grade": "hard" | "medium" | "easy" }`
- Association routes under `/api/practice/cases/:caseId/associations/...` (including `PATCH .../associations/order` with `{ associationIds }`)

Dev seed data lives in `server/src/db/seed.ts` (`bun run db:seed`). Optional vocabulary packs (data only, no schema): `bun run db:seed:english`, `bun run db:seed:japanese`.

After **1.0.0**, schema changes ship as **one numbered SQL file per app version** under `server/drizzle/` (e.g. `0001_1_0_1.sql` for 1.0.1). Run `bun run db:migrate` to upgrade in place (applies idempotent fixes, reconciles the journal if you previously used `db:push`, then runs pending SQL). `bun run db:push` remains a schema-only idempotent upgrade without touching `__drizzle_migrations`.

While **1.0.1** is still in development, edit that version’s migration in place rather than adding `0002_*`. Keep `drizzle/0000_init.sql` at the **1.0.0** baseline and `src/db/schema.ts` at the current target shape.