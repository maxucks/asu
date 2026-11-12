# ASU — Architecture Rules

Clean, feature-sliced architecture for the ASU client. UI is isolated from application logic. External systems are never called from UI or controllers without adapters.

## File naming

- **`snake_case` only** for source files and folders. **No dots** in filenames.
- Pattern: `{feature}_{role}.ts(x)` — e.g. `practice_provider.tsx`, `practice_repository.ts`.
- React route files under `app/` may follow Next.js conventions where required (`page.tsx`, `layout.tsx`).

## Layers and artifacts

| Layer | Artifact | Responsibility |
|-------|----------|----------------|
| UI | `*_ui.tsx`, pages | Render; basic validation; call controllers |
| Controller | `*_controller.ts` | Session logic; injected repos; **view-state factories only** (no inline state objects) |
| View state | `*_view_state.ts` | `type` unions + `create…` / transition helpers for every UI state variant |
| Use case | `*_usecase.ts` | Single operation — **only** if reused or heavily tested |
| Model | `*_model.ts` | Domain **classes** (`fromDto`, stubs); no I/O |
| Transport types | same file as driver/repository | `type` aliases for serialized shapes (no standalone `*_dto.ts`) |
| **Data source** | `core/data_sources/*_data_source.ts`, `Mock*` classes | **Persistence driver** (interface + **class** impls): retrieve/store; **serialize ↔ DTO**; throws on I/O |
| **Repository** | `*_repository.ts` (feature / app logic) | **Class** orchestrating data sources/clients; `Result` + rules; narrow methods per flow |
| **Provider** | `*_provider.tsx` | Feature-local composition: wire data source → repository → route/UI |
| Service | `*_service.ts` | Long-lived workers, caches, daemons — **one file per service** |
| Client / adapter | `*_client.ts`, `*_adapter.ts` | External I/O; map transport errors |

## Data sources, clients, repositories

All **data sources** live under **`src/core/data_sources/`** (shared drivers — not feature folders). Each source is an **external-style driver**: talk to a backing store (SQLite, REST, in-memory prototype, …), **deserialize** into colocated `type`s on read, **serialize** on write. Methods are storage-shaped (e.g. `getCaseDtoById`, `listDueStudyRecordDtos`). **Throw** on failure; no `Result`.

- **Client / adapter** (`*_client.ts`, `*_adapter.ts`) — thin wire to one system (HTTP, Redis, S3). A data source **uses** clients; repositories may use clients directly for caches when there is no domain DTO layer yet (e.g. Redis session cache).
- **Repository** — **application logic**: depends on one or more data sources (and optionally clients), **joins** data (practice queue = due study records + case rows), enforces rules, maps to feature DTOs/models, **catch → `Result` + `AppError`**. Lives with the feature (`practice/practice_repository.ts`) because its API is flow-specific.
- **Controllers / use cases** depend on **repositories** only — never data sources, mocks, or clients.

Prototype: `practice_provider.tsx` builds mock **core** source classes and `new PracticeRepository(...)`.

## File grouping

- **Do not oversplit** — keep tightly coupled, short code together (e.g. `PracticeRepository` class in one `practice_repository.ts`).
- Queue/card `type`s live in `practice_repository.ts`; `practice_model.ts`, `practice_errors.ts` per feature.
- **Split files/folders** only when size, reuse, or clarity demands it (e.g. separate files under `core/data_sources/`, several screens under `ui/`).
- Avoid extra top-level folders for a handful of lines.

## Providers (`*_provider.tsx`)

- Live **next to the feature code** (`practice/practice_provider.tsx`), not a global assembly package.
- Construct **core** data sources (and later clients) + feature repositories; export the screen wrapper (e.g. `PracticeSessionProvider`) for `app/page.tsx`.
- Explicit wiring only — no hidden `get*Repository()` without approval.

## Use case vs controller

- Controller owns React state; repos injected.
- Use case only for shared/complex logic — no proxy-only use cases.

## Application flow

1. Validate (UI/controller vs app layer).
2. Repository → data source(s) / client(s) → persistence DTOs → feature model in controller/use case.
3. Persist/enrich via repository when needed.

## Errors

- **Plan first** — non-trivial work: [BEFORE_YOU_CODE.md](./BEFORE_YOU_CODE.md).
- **Below app layer** (data sources, clients, adapters): normal **throw** on failure; return values on success. **No `Result`, no `AppError`, no structured error handling** unless truly critical (e.g. must not crash a worker).
- **App layer** (repository impl, controllers, use cases): **`Result` + `AppError`** (`core/app_errors.ts`, feature `*_errors.ts`). Repository **try/catch** around data-source calls → map to `PracticeError` (or equivalent).
- **UI/controllers** only consume app-layer `Result` / errors.

## Services

Real long-running or shared tooling only — not DI wiring (use **providers**).

## Anti-patterns

- UI/controllers importing data sources or mocks.
- Repository that only re-exports one data-source call with no mapping/rules (unless temporary).
- God `AppDataSource` — split drivers by storage domain (`case`, `study_record`, …) under `core/data_sources/`.

## Prototype-specific

- Mocks in `core/data_sources/*_mock.ts`. Practice repository joins case + study_record sources for `getQueue()`.
- **Text** associations: `PracticeRepository.addTextAssociation` → `CaseDataSource.appendAssociationDto` (mock mutates in memory). **Other kinds**: session-only stubs until editors exist.
