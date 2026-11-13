# Architecture rules

## Craft

- See [CRAFT.md](./CRAFT.md) — treat code as art; clarity and consistency over volume.

## Naming

- **`snake_case`** files/folders; **no dots** except Next `app/` routes.
- Pattern: `{feature}_{role}.ts(x)`.
- **Exported constants:** PascalCase identifiers (`PracticeGrades`, `PracticeErrorCodes`).
- **Machine string values** (API/error codes): lowercase `snake_case` (`practice_no_cards`).

## Layers (who calls whom)

| Artifact | File pattern | Rules |
|----------|----------------|-------|
| UI | `*_ui.tsx` | Render only; controller only |
| Controller | `*_controller.ts` | Use cases + repo injected; view state via **create\*** factories |
| View state | `*_view_state.ts` | Union types + transition helpers |
| Model | `*_model.ts` | Classes, `fromDto`; no I/O |
| Repository | `*_repository.ts` | Join sources; domain invariants (e.g. association kind); **`Result` + AppError**; **no input sanitization** |
| Data source | `core/data_sources/*` | Concrete class (no interface); storage API; DTOs from `@asu/contracts`; **throw** |
| Provider | `*_provider.tsx` | Wire sources → repo → UI (feature-local) |
| Utils | `core/utils/*` | Small shared helpers (e.g. `request_json`); no domain I/O surface |
| HTTP response (server) | `core/hono_response.ts` | `data(c, body, 2xx)`, `ok`, `created`, `noContent`, `error(c, appError, status?)`, `badRequest`, `notFound`, `internalError` — not raw `c.json` in routes |
| Use case (client) | `*_usecase.ts` | Glue when reused or non-trivial; parse/validate → repository; **`Result` + AppError** |
| Routes (server) | `*_routes.ts` | **Handler = glue/use case** for simple, single-route flows: **Zod** on params/body (`*_route_schemas.ts`), then repository — no extra `*_usecase.ts` on server |

- Transport **`type`s** live in driver/repository files — no standalone `*_dto.ts`.
- **Do not oversplit**; split when size/reuse demands it.

## Errors

- **Data sources / clients:** throw on failure; no `Result`.
- **Repository+:** try/catch → feature `*Error`; expose `Result`.
- **UI/controller:** consume `Result` only.

## Glue, validation, repository (critical)

- **Input validation** (trim, URL normalize, empty checks, request shape) belongs in **glue**, never in the repository.
- **Server:** Hono handlers in `*_routes.ts` + **Zod** schemas (`*_route_schemas.ts`, `core/validate_request.ts`). Handlers validate → call repository. Responses only via `core/hono_response.ts`; map feature error codes to HTTP status in `*_errors.ts` (e.g. `practiceErrorHttpStatus`), then `error(c, appError, status)`. Do **not** add server `*_usecase.ts` for one-off route logic.
- **Client:** controller → `*_usecase.ts` when useful (e.g. practice mutations); same parsers from `@asu/contracts` as on the server.
- Shared parse rules live in `@asu/contracts` (e.g. `parsePracticeAssociationText`); Zod schemas compose those parsers for HTTP bodies.
- **Repository** methods assume **already valid** domain values; they orchestrate data sources, enforce domain rules (e.g. “this association is text, not image”), and assemble queues.
- **Forbidden:** a public repository method that only validates/sanitizes then `return this.somePrivateMethod(...)` — no validate-then-proxy wrappers, no split public/private pairs for the same operation.
- **Forbidden:** duplicating the same validation in repository and use case.
- One use-case function ≈ validate → single repository call. Repository method ≈ full orchestration in one place (no thin delegate to another private method).

## Data sources vs repository

- Sources under `src/core/data_sources/` by domain (`case`, `study_record`, …).
- Repository = app logic (e.g. queue = due study records + cases).
- Prototype: `*_mock.ts` or `http_*_data_source.ts`; `practice_provider` wires sources → `PracticeRepository`.
- **HTTP on the client:** `http_*_data_source.ts` classes call the API directly (shared `core/utils/request_json.ts` for fetch + JSON errors). Do **not** add a parallel feature `*_api_client` that duplicates the data-source API.
- **Kind-specific writes:** when text and image (or other kinds) use different validation, API paths, or columns, expose **separate** data-source methods (e.g. `updateTextAssociationContentRefDto`, `updateImageAssociationContentRefDto`). Do not use one generic `update*ContentRef` that loads the row and branches on `association.kind` — keep that check in the repository only, then call the matching source method.
- **Changing architecture:** before adding a new layer, artifact type, or pattern (e.g. extra client between repo and source), **ask the project owner** and align with these docs — do not introduce it unilaterally in a task.

## Anti-patterns

- UI/controller imports data source, mock, or client.
- Repository that only passthroughs one source call (except temporary).
- Repository **wrapper** methods: validate/normalize input then forward to a `private` method (validate in glue instead).
- Server `*_usecase.ts` that only wraps one handler’s validate → repo call (put that in the route handler).
- Route-local helpers that only wrap `error(c, …)` / `ok(c, …)` from `hono_response.ts` (call the util inline; repeat is fine).
- Monolithic “god” data source.
- One data-source “update content ref” entry point that dispatches on `AssociationKind` instead of distinct methods aligned with repository/API.
- Feature-specific HTTP **client** class alongside HTTP **data sources** for the same domain (use sources + `request_json` instead).
- Use cases that skip validation and only rename the repository call (trivial aliases).
- DI globals without provider.

## Prototype

- See [PROTOTYPE_STAGE.md](./PROTOTYPE_STAGE.md).
