# Data model rules

Target schema for repositories (in-memory mocks now; SQL/API later). **Case** is the anchor.

## Entities

| Entity | Key rules |
|--------|-----------|
| **Language** | Has many cases; delete cascades cases |
| **Case** | `lemma_text`, optional `meaning` (sense description)/image/nuance; belongs to one language |
| **Example** | `text`; many per case; cascade on case delete |
| **Association** | `kind`, `content_ref`, `hidden_from_practice`, optional `sort_order`, `created_at`; many per case |
| **StudyRecord** | PK **`case_id`** (prototype); one row per studied case |
| **Relation** | Kind catalog: `name`, `direction` (uni/bi) |
| **CaseRelation** | `(left_case_id, right_case_id, relation_id)` |
| **Note**, **CaseNote** | M:N notes ↔ cases |

## Study record (fields)

- `review_status`: `new` \| `learning` \| `repeating` \| optional `paused`
- `scheduling_strength_numeric`, `repetitions_count`, `last_repetition_at`, `due_at`
- Optional `last_grade_numeric`; UI maps hard/medium/easy ↔ numbers in config

**Future:** PK `(learner_id, case_id)` when **Learner** exists.

## CaseRelation

| Kind direction | Rows |
|----------------|------|
| Unidirectional | One: `A → B` |
| Bidirectional | Two: `A → B` and `B → A` |

- Reads: “from case X” = `left_case_id = X` only.
- Writes: repository keeps bidirectional pairs in sync.

## Queue queries (logical)

1. Due: `repeating` and `due_at <= now`
2. New: no row or `review_status = new`
3. Learning: `review_status = learning`
4. Filter cases by `language_id`
5. Load associations (± examples) for case ids

## Integrity (on delete)

- Language → cases → examples, associations, study records, case relations, case-note links
- Relation kind in use → restrict delete
- Note shared across cases → drop **CaseNote** links; note row policy TBD

## Prototype

- No DB file; mocks mirror field names and relationships.
- Optional later: JSON export of same graph.

## Deferred

- **Lemma** table, **Collection**, **Learner**, **ReviewEvent**, **MediaAsset**
