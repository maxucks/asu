# ASU web client

Associative vocabulary learning — practice UI against the Bun API.

## Run

```bash
bun install
```

Start the API from `server/` (`bun run dev`), then:

```bash
bun dev
```

[http://localhost:3000](http://localhost:3000) — practice session (`NEXT_PUBLIC_ASU_API_URL` defaults to `http://127.0.0.1:3001`).

**Stack:** Next.js, TypeScript, Tailwind, Bun.

## Docs (`docs/`)

| File | Purpose |
|------|---------|
| [PROTOTYPE_STAGE.md](./docs/PROTOTYPE_STAGE.md) | Prototype scope |
| [BEFORE_YOU_CODE.md](./docs/BEFORE_YOU_CODE.md) | Plan before non-trivial work |
| [CRAFT.md](./docs/CRAFT.md) | Code as craft |
| [ARCHITECTURE_RULES.md](./docs/ARCHITECTURE_RULES.md) | Layers, errors, naming |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Repo layout and flow |
| [PROJECT_DESCRIPTION.md](./docs/PROJECT_DESCRIPTION.md) | Product + glossary |
| [DATABASE_ARCHITECTURE.md](./docs/DATABASE_ARCHITECTURE.md) | Target data model |
| [SCHEMA_SKETCH.md](./docs/SCHEMA_SKETCH.md) | Legacy — ignore |

## This repo now

- Practice session (associations, reveal, grades, edit/delete entry on card, FAB to add entry).
- Persistence via `server/` SQLite; no in-browser mock data sources.