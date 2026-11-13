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

Loads `server/.env` via `--env-file server/.env` with monorepo root as cwd so `@asu/contracts` is hot-watched. If you change `PORT`, set `NEXT_PUBLIC_ASU_API_URL` in `web_client/.env.local` to match.

Default: `http://localhost:3001`

- `GET /health`
- `GET /api/practice/queue`
- Association routes under `/api/practice/cases/:caseId/associations/...`

Seed data is shared with `web_client` mocks (`SEED_CASES`, `SEED_STUDY_RECORDS`).
