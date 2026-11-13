# Architecture (repo)

- Client-only **Next.js** prototype; backend later.
- **Bun**, **TypeScript**, **Tailwind**; files **`snake_case`**.

## Layout rules

- `src/core/data_sources/` — driver interfaces, boundary types, mocks.
- `src/practice/` — feature: repository, model, errors, provider, controller, view state, `ui/`.
- `src/app/` — Next routes (`page.tsx`, `layout.tsx`).

## Flow

`app/page` → **provider** → **UI** → **controller** → **repository** → **data sources** (later **clients**).

- **Controller** → repository only.
- **Provider** wires mocks/sources → repository → screen.

## See also

[CRAFT.md](./CRAFT.md) · [ARCHITECTURE_RULES.md](./ARCHITECTURE_RULES.md) · [PROJECT_DESCRIPTION.md](./PROJECT_DESCRIPTION.md) · [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) · [PROTOTYPE_STAGE.md](./PROTOTYPE_STAGE.md)
