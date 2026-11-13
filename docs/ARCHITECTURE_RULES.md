# Architecture rules

## Craft

- See [CRAFT.md](./CRAFT.md) — treat code as art; clarity and consistency over volume.

## Naming

- **`snake_case`** files/folders; **no dots** except Next `app/` routes.
- Pattern: `{feature}_{role}.ts(x)`.

## Layers (who calls whom)

| Artifact | File pattern | Rules |
|----------|----------------|-------|
| UI | `*_ui.tsx` | Render; light validation; controller only |
| Controller | `*_controller.ts` | Repos injected; view state via **create\*** factories |
| View state | `*_view_state.ts` | Union types + transition helpers |
| Model | `*_model.ts` | Classes, `fromDto`; no I/O |
| Repository | `*_repository.ts` | Join sources; rules; **`Result` + AppError** |
| Data source | `core/data_sources/*` | Storage-shaped API; DTO types colocated; **throw** |
| Provider | `*_provider.tsx` | Wire sources → repo → UI (feature-local) |
| Client/adapter | `*_client.ts`, `*_adapter.ts` | External I/O; used by sources/repos, not UI |
| Use case | `*_usecase.ts` | Only if reused or heavily tested |

- Transport **`type`s** live in driver/repository files — no standalone `*_dto.ts`.
- **Do not oversplit**; split when size/reuse demands it.

## Errors

- **Data sources / clients:** throw on failure; no `Result`.
- **Repository+:** try/catch → feature `*Error`; expose `Result`.
- **UI/controller:** consume `Result` only.

## Data sources vs repository

- Sources under `src/core/data_sources/` by domain (`case`, `study_record`, …).
- Repository = app logic (e.g. queue = due study records + cases).
- Prototype: `*_mock.ts`; `practice_provider` builds mocks + `PracticeRepository`.

## Anti-patterns

- UI/controller imports data source, mock, or client.
- Repository that only passthroughs one source call (except temporary).
- Monolithic “god” data source.
- Proxy-only use cases; DI globals without provider.

## Prototype

- See [PROTOTYPE_STAGE.md](./PROTOTYPE_STAGE.md).
