---
name: asu-project-docs
description: >-
  Implements and extends the ASU associative vocabulary app using project
  documentation and ARCHITECTURE_RULES. Use when working in the ASU repo on
  features, layers, domain names (case, association, study record), practice
  SRS, or mock repositories.
---

# ASU project documentation skill

## When to apply

- Any code or design change in the ASU repository
- Adding features, controllers, repositories, or UI
- Questions about domain terms or data model

## Read first (in order)

0. [BEFORE_YOU_CODE.md](../../../docs/BEFORE_YOU_CODE.md) — **write a plan before coding**
1. [ARCHITECTURE_RULES.md](../../../docs/ARCHITECTURE_RULES.md) — layering, errors, naming, anti-patterns
2. [ARCHITECTURE.md](../../../docs/ARCHITECTURE.md) — current repo layout and scope
3. [PROJECT_DESCRIPTION.md](../../../docs/PROJECT_DESCRIPTION.md) — product glossary and behavior
4. [DATABASE_ARCHITECTURE.md](../../../docs/DATABASE_ARCHITECTURE.md) — entities and relationships (target persistence)

## Ignore unless asked

- [SCHEMA_SKETCH.md](../../../docs/SCHEMA_SKETCH.md) — outdated Drizzle sketch from an earlier idea

## Domain vocabulary (use consistently)

| Term | Meaning |
|------|---------|
| Case | One learnable unit; one SRS card |
| Lemma | Text on the case (no lemma table in prototype) |
| Example | Sample sentence for a case |
| Association | Memory cue (`kind`, `content_ref`); many per case |
| Relation | Link between cases (not in practice UI yet) |
| Study record | SRS state per case |

Grades: **hard / medium / easy** (numeric later). Status: **new / learning / repeating**.

## Implementation checks

- **snake_case** filenames, **no dots** (`practice_repository.ts`, `practice_session_controller.ts`)
- Feature **provider** (`practice_provider.tsx`): wire **core** data sources → repository → UI
- Controllers/repos only; **never** data sources, mocks, or clients in UI/controllers
- **`core/data_sources/`** — driver **interfaces** + mock **classes**; **`PracticeRepository`** class joins sources, `Result`
- Transport `type`s in `*_data_source.ts` / `practice_repository.ts`; domain classes in `practice_model.ts`
- Session UI state: `practice_session_view_state.ts` — all `PracticeSessionViewState` values via `create*` helpers
- Data layer: **throw**; app layer: `Result` / `AppError` (repository catches and maps)
- No pointless use-case wrappers; no persistence in UI

## Current prototype scope

- **In scope:** `practice/` — associations display, add stubs in session state, Anki-like show answer + grade buttons, mock queue
- **Out of scope:** vocabulary CRUD, auth, server, real storage, non-text association editors (stubs only)

## Backend note

This repo is client-only. A future Go/Node service is a separate project; use adapter/client layer when integrating.
