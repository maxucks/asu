# ASU

Associative vocabulary practice — monorepo.

| Package | Role |
|---------|------|
| [`web_client/`](web_client/) | Next.js UI |
| [`server/`](server/) | Bun + Hono API, SQLite |
| [`packages/contracts/`](packages/contracts/) | Shared DTOs and dev seed data |

```bash
cd packages/contracts && bun install
cd server && bun install
cd web_client && bun install
```

**Server** (`cd server`): copy `.env.example` → `.env`, then `bun run db:setup`, `bun run dev`.

**Web** (`cd web_client`): optional `.env.local` from `.env.example`, then `bun run dev`.

Each package has its own `format` / `lint` / `typecheck` scripts.

Docs: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`docs/AGENT_HANDOFF.md`](docs/AGENT_HANDOFF.md)
