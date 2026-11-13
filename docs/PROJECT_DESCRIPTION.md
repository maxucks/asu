# Product rules

## Idea

- Learn vocabulary via **associations** (cues), not single gloss lines.
- **Practice** = Anki-like SRS; card shows association bundle; add associations **during** session.

## Glossary (use these names)

| Term | Rule |
|------|------|
| **Language** | Top partition; no collections in this stage |
| **Case** | One learnable unit = **one SRS card** |
| **Lemma** | Text on the case only — **no lemma table** |
| **Example** | Sample sentence(s) — not “context” / “showcase” |
| **Association** | Memory cue (`kind`, `content_ref`); many per case |
| **Relation** | Directed link between cases + kind (synonym, …) |
| **Study record** | SRS state **per case** (one implicit learner) |
| **Note** | Free text; M:N with cases (future vocabulary UI) |

## Practice

- Queue from **study record** (due / new / learning).
- Grade UI: **hard**, **medium**, **easy** → store numeric later.
- Status UI: **new**, **learning**, **repeating** (optional **paused** later).
- Associations on a card are **presentation**; SRS unit is always the **case**.

## Associations

- Open kinds: text, image, audio, sketch, video, …
- Created in library or in practice; same pool per case.

## Prototype constraints

- Single learner; no auth/sync.
- **Offline-first**; network only for user-chosen media URLs (e.g. image link).
- Storage: [PROTOTYPE_STAGE.md](./PROTOTYPE_STAGE.md).

## Later (names stay)

- Lemma table, collections, learners, sync, language modules, collaboration via **import copies**.

## Relations (storage)

- Edge: **left case → right case** + relation kind.
- **Unidirectional:** one row `(A, B)`.
- **Bidirectional:** two rows `(A, B)` and `(B, A)`; create/delete in pairs in repository.

Details: [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md).
