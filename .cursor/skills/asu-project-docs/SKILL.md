---
name: asu-project-docs
description: >-
  Implements and extends the ASU associative vocabulary app using project
  documentation and ARCHITECTURE_RULES. Use when working in the ASU repo on
  features, layers, domain names (case, association, study record), practice
  SRS, or mock repositories.
---

# ASU docs skill

## Read order

1. [CRAFT.md](../../../docs/CRAFT.md)
2. [PROTOTYPE_STAGE.md](../../../docs/PROTOTYPE_STAGE.md)
3. [ARCHITECTURE_RULES.md](../../../docs/ARCHITECTURE_RULES.md)
4. [ARCHITECTURE.md](../../../docs/ARCHITECTURE.md)
5. [PROJECT_DESCRIPTION.md](../../../docs/PROJECT_DESCRIPTION.md)
6. [DATABASE_ARCHITECTURE.md](../../../docs/DATABASE_ARCHITECTURE.md)
7. Non-trivial work: [BEFORE_YOU_CODE.md](../../../docs/BEFORE_YOU_CODE.md)

**Ignore:** [SCHEMA_SKETCH.md](../../../docs/SCHEMA_SKETCH.md)

## Domain names

Case · Example · Association · Study record · Relation · Language — meanings in PROJECT_DESCRIPTION.

Grades: hard / medium / easy. Status: new / learning / repeating.

## Code rules (quick)

- Craft: [CRAFT.md](../../../docs/CRAFT.md) (code is art).
- `snake_case` filenames; provider wires `core/data_sources` mocks → repository → UI.
- Controller → repository only; data layer throws; repository returns `Result`.
- View state: `create*` helpers in `*_view_state.ts`.
