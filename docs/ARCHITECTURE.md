# Architecture (repo)

- **Monorepo:** `web_client/` (Next.js), `server/` (Bun + Hono API), `packages/contracts/` (shared DTOs).
- **Bun**, **TypeScript**, **Tailwind** on the client; files **`snake_case`**.
- **Prettier**, **ESLint**, **TypeScript** config per package (`web_client/`, `server/`, `packages/contracts/`).

## Layout rules

### `web_client/`

- `src/core/data_sources/` — concrete drivers (`*_mock.ts`, `http_*_data_source.ts`). No driver interfaces.
- `src/core/utils/` — shared non-domain helpers (e.g. `request_json.ts`).
- `src/practice/` — repository, model, errors, provider, controller, view state, `ui/`.
- `src/app/` — Next routes (`page.tsx`, `layout.tsx`).

### `server/`

- `src/core/data_sources/` — Drizzle/SQLite classes (throw on failure); repositories depend on these implementations directly.
- `src/practice/` — repository, Hono routes, feature errors.
- `src/db/` — schema, migrate, seed.
- SQLite file default: `server/data/asu.sqlite`.

### `packages/contracts/`

- DTOs, consts, small pure helpers (e.g. image URL normalize). No I/O.

## Flow

**Client:** `app/page` → **provider** → **UI** → **controller** → **use case** / **repository** → **data sources** (HTTP or mocks).

**Server:** Hono route (Zod + handler glue) → **repository** → **Drizzle data sources**.

- **Controller** → repository only.
- **Provider** wires mocks/sources → repository → screen.

## See also

[CRAFT.md](./CRAFT.md) · [ARCHITECTURE_RULES.md](./ARCHITECTURE_RULES.md) · [PROJECT_DESCRIPTION.md](./PROJECT_DESCRIPTION.md) · [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) · [PROTOTYPE_STAGE.md](./PROTOTYPE_STAGE.md)
