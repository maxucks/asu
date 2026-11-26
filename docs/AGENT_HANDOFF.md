# Agent handoff (ASU monorepo)

Read this first when continuing work in a new session. Authoritative rules: [ARCHITECTURE_RULES.md](./ARCHITECTURE_RULES.md). Project skill: `.cursor/skills/asu-project-docs/SKILL.md`.

## Product

Associative vocabulary app (Anki-like practice + user-defined associations). Domain: **case** (**value** + **meaning** prose, not a gloss), **association**, **study record**, **language**. Grades: `hard` | `medium` | `easy`. Review status: `new` | `learning` | `repeating`.

## Repo layout

| Package | Role |
|---------|------|
| `server/` | Bun + Hono API, Drizzle + SQLite (`server/data/asu.sqlite`) |
| `web_client/` | Next 15 app, Tailwind |

No root `package.json` — install deps per package (`server/`, `web_client/`). Response DTO types live next to data sources and `practice_repository`; dev seed is `server/src/db/seed.ts` only. Copy `server/.env.example` → `server/.env` once.

**Server dev:** from `server/`, `bun run dev`.

## Architecture (do not violate)

1. **No new layers without owner approval** — no feature `*_api_client` between HTTP and data sources; no server `*_usecase.ts` for one-off routes.
2. **Validation in glue** — server: Zod in `*_route_schemas.ts` + handlers in `*_routes.ts`. Client: **controller** parses → repository (parsers in `practice_utils.ts` / `practice_model.ts`). No `*_usecase.ts` that only wraps one validate → repo call.
3. **Repository** — orchestration + domain invariants only; **no** input trim/URL checks; **no** validate-then-`private` wrapper methods.
4. **Data sources** — concrete classes, throw on failure; separate methods per kind for writes (e.g. `updateTextAssociationContentRefDto` / `updateImageAssociationContentRefDto`).
5. **HTTP responses (server)** — only `core/hono_response.ts`: `data`, `ok`, `created`, `noContent`, `error`, `badRequest`, `notFound`, `internalError`. Call **inline** in routes — **no** route-local `respondXError` helpers.
6. **Client HTTP** — `http_*_data_source.ts` + shared `queueCardsById` map in `app/page.tsx`; `core/utils/request_json.ts`.

## Naming conventions (constants)

- **Exported constant identifiers:** PascalCase (`PracticeGrades`, `PracticeErrQueueEmpty`, `PracticeErrorCodes`).
- **Machine-facing string values (error codes, API codes):** lowercase `snake_case` (`practice_no_cards`, `internal_error`).
- **User-facing messages:** English prose in `PracticeErrorMessages` (unchanged human copy).
- **Files/folders:** `snake_case` per ARCHITECTURE_RULES.

## Practice feature (current)

### Client flow

`app/page.tsx` → `practiceContext.Provider` → `SessionScreen` → `SessionScreenLogic` → `usePracticeSessionController` → `usePracticeRepo` → repository → API.

`NEXT_PUBLIC_ASU_API_URL` default `http://127.0.0.1:3001`.

### Server flow

`practice_routes` (Zod + `error`/`ok`) → `PracticeRepository` → Drizzle data sources.

### API

- `GET /api/practice/queue`
- `POST|PATCH|DELETE` … `/api/practice/cases/:caseId/associations/...`
- `hiddenFromPractice` body must be boolean (Zod).

### Not done / known gaps

- **Grading (SRS)** persists via `POST /api/practice/cases/:caseId/grade`; queue uses `study_records` ordering.
- Client: `http_*_data_source.ts` only (run the API server for practice data).
- Seed: `server/src/db/seed.ts` (`SEED_CASES` with English vocab, `meaning` field).

## Key files

| Area | Paths |
|------|--------|
| Server routes | `server/src/practice/practice_routes.ts`, `practice_route_schemas.ts` |
| Server HTTP | `server/src/core/hono_response.ts`, `validate_request.ts` |
| Client glue | `web_client/src/practice/practice_session_controller.ts` (parse → repo) |
| Client feature utils | `practice_utils.ts`, `practice_model.ts` |
| Errors | `*/practice/practice_errors.ts` + prebuilt `PracticeErr*` constants |

## Anti-patterns (recently corrected — do not reintroduce)

- `PracticeApiClient` duplicate layer
- Server `practice_association_usecases.ts`
- `practiceErr(c)` / `respondPracticeError` route wrappers
- Repository methods that only validate then call `private` helpers
- SCREAMING_SNAKE error code strings or `camelCase` exported error singletons

## Docs to read for features

[CRAFT.md](./CRAFT.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [PROJECT_DESCRIPTION.md](./PROJECT_DESCRIPTION.md) · [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) · ignore [SCHEMA_SKETCH.md](./SCHEMA_SKETCH.md).
