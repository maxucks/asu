# Architecture (repo)

- **Monorepo:** `web_client/` (Next.js), `server/` (Bun + Hono API).
- **Bun**, **TypeScript**, **Tailwind** on the client; files **`snake_case`**.
- **Prettier**, **ESLint**, **TypeScript** config per package (`web_client/`, `server/`).

## Layout rules

### `web_client/`

- `src/core/data_sources/` — HTTP drivers (`http_*_data_source.ts`). No driver interfaces.
- `src/core/utils/` — shared non-domain helpers (e.g. `request_json.ts`).
- `src/practice/` — `context/`, `practice_context_value.ts`, `hooks/`, domain modules, `components/{session,assoc,case}/`.
- `src/core/components/atoms/` — shared primitives (`TextField`, `EmojiPop`).
- `app/page.tsx` — wires HTTP sources → `PracticeRepository`, `practiceContext.Provider` → `SessionScreen`.
- `src/app/` — Next routes (`page.tsx`, `layout.tsx`).

### `server/`

- `src/core/data_sources/` — Drizzle/SQLite classes (throw on failure); repositories depend on these implementations directly.
- `src/practice/` — repository, Hono routes, feature errors.
- `src/db/` — schema, migrate, seed.
- SQLite file default: `server/data/asu.sqlite`.

## Flow

**Client:** `app/page` → **SessionScreen** → **SessionScreenLogic** (controller hook) → **repository** → **HTTP data sources**.

**Server:** Hono route (Zod + handler glue) → **repository** → **Drizzle data sources**.

- **Controller** → repository only.
- **`app/page.tsx`** wires HTTP sources → repository → screen (no separate provider wrapper).

## See also

[CRAFT.md](./CRAFT.md) · [ARCHITECTURE_RULES.md](./ARCHITECTURE_RULES.md) · [PROJECT_DESCRIPTION.md](./PROJECT_DESCRIPTION.md) · [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) · [PROTOTYPE_STAGE.md](./PROTOTYPE_STAGE.md)
