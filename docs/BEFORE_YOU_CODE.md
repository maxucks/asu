# Before you code

**Required for humans and agents:** write a short plan here (or in the chat) **before** implementing non-trivial changes. Wait for alignment if the user asked for plan-first.

## Plan template

```
## Intent
One sentence.

## Layers touched
UI | controller | repository | data source | provider | docs

## Error / data rules
Does this stay in app layer (Result + AppError) or throw below?

## Files (expected)
- add/change/remove list

## Out of scope
What this change explicitly does not do.
```

---

## Current / last plan (errors & data sources)

**Intent:** Data layer throws; no `Result` below repository. App layer keeps `Result` + `AppError`.

**Layers:** data source (throw), repository (try/catch → `PracticeError`), docs.

**Out of scope:** HTTP client adapters, controller changes beyond existing `Result` consumption.
