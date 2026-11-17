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

Dev seed data lives in `server/src/db/seed.ts` (`bun run db:seed`).

### Schema changes (pre-release)

Do **not** add numbered SQL migrations under `server/drizzle/`. Update `drizzle/0000_init.sql` and keep `src/db/schema.ts` in sync. For existing local SQLite files, extend `src/db/push_schema.ts` with small idempotent `ALTER`/column checks (same pattern as `cases.meaning`). Use `bun run db:push` to apply.