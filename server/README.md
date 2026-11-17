# ASU API server

Bun + Hono + SQLite (Drizzle). Same layer rules as `web_client`: routes → repository → data sources.

## Setup

```bash
cd server
cp .env.example .env
bun run db:setup
```

If you already had a database before language icons were added, apply pending SQL migrations once:

```bash
cd server
bun run db:migrate
```

(`db:push` also adds `languages.icon` on existing files when you re-run it.)

```bash
bun run dev
```

Loads `.env` from the server directory. If you change `PORT`, set `NEXT_PUBLIC_ASU_API_URL` in `web_client/.env.local` to match.

Default: `http://localhost:3001`

- `GET /health`
- `GET /api/practice/queue`
- Association routes under `/api/practice/cases/:caseId/associations/...`

Dev seed data lives in `server/src/db/seed.ts` (`bun run db:seed`).
