# ASU — Application Architecture (brief)

Client-only **Next.js** prototype. Separate backend later. **Bun**, **TypeScript**, **Tailwind**. File names: **snake_case**.

## Layout

```
src/
  core/
    app_errors.ts
    data_sources/               # driver interfaces + boundary types + mocks
      case_data_source.ts
      case_data_source_mock.ts
      study_record_data_source.ts
      study_record_data_source_mock.ts
  practice/                     # app logic + UI for review sessions
    practice_errors.ts
    practice_model.ts             # PracticeCard, Association classes
    practice_repository.ts      # PracticeRepository class
    practice_provider.tsx
    practice_session_view_state.ts  # UI state types + create* factories
    practice_session_controller.ts
    ui/
```

## Layer flow

```
app/page → practice_provider → UI → controller(repo) → repository → core/data_sources (+ future clients)
```

**Controllers** use **repositories** only. **Repositories** combine **data sources** (and later **clients** for Redis, HTTP, etc.). **Providers** wire concrete drivers into repositories for a feature.

## Docs

[ARCHITECTURE_RULES.md](./ARCHITECTURE_RULES.md) · [PROJECT_DESCRIPTION.md](./PROJECT_DESCRIPTION.md) · [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md)

Skill: **`asu-project-docs`**
