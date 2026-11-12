# ASU — Project Description

## Vision

ASU is a personal language-learning environment built around **remembering words through associations**, not through bare text on flashcards. Learners build a rich library of how words actually live in context—meanings, tone, example sentences, and personal memory hooks (images, sounds, sketches, notes, and more). A dedicated **practice** flow then uses spaced repetition (similar in rhythm to Anki) while surfacing those associations instead of a single dry definition line.

The product is intentionally phased: first a **solo, offline prototype** for one learner on one device, then growth into sync, accounts, collaboration, and mobile—without throwing away the core model of “case + examples + associations + SRS.”

---

## Problem and approach

Traditional flashcard tools optimize for text pairs. Real vocabulary lives in **context**: register, connotation, formality, and personal hooks. ASU treats each learnable unit as a **case**—a specific meaning or usage the learner cares about: not only the lemma text “answer,” but how it is meant, illustrated, and remembered, with optional nuance dimensions (rudeness, formality, connotation).

Practice sessions ask the learner to recall the target from **multiple association cues** they chose or created. Associations can be added **during** review, so the library improves while studying—organic growth rather than a one-time setup chore.

---

## Core concepts (glossary)

| Term | Role | Notes |
|------|------|--------|
| **Language** | Top-level partition | Groups all cases for that language; optional language-specific modules later (e.g. Japanese symbol drilling). **No collections in this stage.** |
| **Case** | One learnable unit | Context-specific meaning/usage; **one spaced-repetition card**. Holds lemma text, translation, description, optional image, nuance scores, examples, relations, associations, notes. |
| **Lemma (text on case)** | What is being learned | The word or phrase as entered for this case. **No separate lemma entity** in this stage—each case stores its own lemma text. |
| **Example** | Usage in a sentence | One or more sample utterances showing the case; preferred name over “context,” “showcase,” or “case_show.” |
| **Relation** | Link between two cases | e.g. synonym, antonym, “confused with”; may be uni- or bidirectional depending on relation kind. |
| **Association** | Memory cue | Drawing, image, voice note, mnemonic text, audio/video fragment, etc.; **many per case**, often created mid-session. |
| **Study record** | SRS state per case | Scheduling data for the implicit learner: numeric strength/interval inputs, **review status**, repetition count, last review time. |
| **Note** | Free-form annotation | Reusable text blocks attachable to one or more cases. |

### Why **Example** (not showcase / case_show)

- **Example** matches learner expectations and dictionary habit (“example sentence”).
- **Showcase** implies presentation or marketing, not pedagogy.
- **case_show** couples awkwardly to the domain term *case* and reads like an internal identifier, not UI language.

Use **Example** in the product and in architecture docs.

### Deferred: **Lemma** (entity)

A future **lemma** row could group several cases under one headword (inflections, noun vs verb). For this stage the **lemma table is omitted**; only the **lemma text field on the case** exists. There is **no `used_as` or grammatical-role split** between word and case—those concerns live in description, examples, or nuance if needed at all.

---

## Product areas

### 1. Vocabulary (library)

Purpose: curate what to learn.

- Add and organize **languages** only—no collections yet.
- For each **case**: lemma text, meaning/translation, description, nuance hints, **examples**, notes, **relations** to other cases, associations (initial set).
- Filter and browse by language; search across cases.
- No requirement to finish metadata before practicing.

### 2. Practice (remembering)

Purpose: drive long-term retention.

- Queue driven by **spaced repetition**—**one card = one case**.
- Prompt shows association bundle (and optionally examples / nuance), not only a gloss.
- After recall, learner grades with **readable labels**; the system stores **numeric** values for scheduling.
- **During the session**, add new associations without leaving the flow.
- **Study record** drives what appears when: status (e.g. new vs repeating) plus interval logic.

### 3. Future: language modules

Optional focused experiences per language (e.g. kana/kanji drills) that still connect to the same case/association model where possible.

### 4. Future: collaboration

Not in the first iteration. Later: shared packs or co-editing via **copy into my library**, not shared mutable rows.

---

## Grading and review status

### Self-grade (response quality)

- **Stored:** numeric value(s) suitable for SRS (e.g. ease factor, interval multiplier, or a single performance score—exact formula TBD).
- **Shown:** human labels **`hard`**, **`medium`**, **`easy`** (three levels for the prototype; map monotonically to numbers).

Hard = struggle / fail; medium = recalled with effort; easy = confident recall. Labels are presentation; scheduling always uses the numeric layer.

### Card status (queue / lifecycle)

Separate from the grade on a single review—the **status** describes where the case sits in the learning pipeline. Suggested set (names can match UI copy):

| Status | Meaning |
|--------|---------|
| **new** | Never studied; not yet in the repeating pipeline |
| **learning** | Seen at least once; short steps until first graduation |
| **repeating** | On the day-to-day SRS schedule (due / not due) |
| **paused** | Optional later: excluded from queue without deleting content |

Status is derived or stored on the **study record** so lists can show badges like “12 new, 5 due today.” Exact rules (e.g. when `new` → `learning` → `repeating`) follow the SRS algorithm you pick next.

---

## Content ownership (first iteration)

- **All content is user-created** on the prototype device—no built-in catalog.
- **App-scoped catalog** is out of scope; future official packs arrive as **imported copies**.

---

## Learner identity, persistence, and prototype stack

Constraints for this stage:

- **No accounts, no auth, single implicit learner.**
- **Offline-first**; optional network only for user-chosen media URLs.
- **In-memory** as the live store for the prototype (fast iteration; data lives for the app session unless export is added later).
- **Repository-shaped access:** the app talks to storage only through narrow repository interfaces backed by in-memory implementations whose shape mirrors the future database. Swapping in SQLite, a local file, or a remote API later should not reshape vocabulary or practice logic.

Treat **export/import of the full graph** as a near-term safety net if the prototype stays in-memory without a database file.

**Later:** learner accounts, sync, mobile—**case / example / association / study record** stay stable; persistence and ownership layers grow underneath.

---

## Spaced repetition scope

- **Unit of review:** one **case**.
- Multiple associations are **presentation** on the same card, not separate SRS items.
- **Study record** holds: status, numeric scheduling state, repetitions count, last repetition time, and derived “due” time.

---

## Associations model

- **Cardinality:** many associations per case.
- **Lifecycle:** created in vocabulary **or** during practice; same pool.
- **Ordering:** user priority or recency during session (TBD in UI).
- **Types:** open set (image, audio, sketch, text, video, …).

---

## Non-goals (prototype phase)

- Multi-user auth and cloud sync.
- Community marketplace and real-time collaboration.
- Built-in app-owned curriculum.
- **Collections** (grouping beyond language).
- Separate **lemma** entity and **`used_as`** metadata.
- Physical database file (repositories are in-memory mocks for now).

---

## Success criteria

1. Learner can define languages and **cases** with **examples** and notes.
2. Learner can attach multiple associations and add more while practicing.
3. Practice queue respects SRS per case; grades use **hard / medium / easy**; status shows **new / learning / repeating** (and similar).
4. Storage is **in-memory** behind **repository** boundaries that match the documented entity model.
5. Model survives adding real persistence, learners, and backend later without renaming core entities.

---

## Open questions (for later passes)

1. **SRS formula:** which numeric fields on the study record (ease, interval days, stability, etc.).
2. **Relation kinds:** fixed catalog only vs user-defined relation names.
3. **Nuance dimensions** (rudeness, formality, connotation): always in practice, sometimes, or vocabulary-only.
4. **Collaboration shape:** when you reach it—read-only packs vs fork vs co-edit.
5. **Lemma entity:** reintroduce when duplicate lemma text across cases or inflection grouping becomes painful.
6. **Session export format:** JSON bundle vs other—once in-memory pain appears in daily use.

---

## Relation between cases (clarification)

**Relation** answers: “how does this case connect to another case?” (synonym, antonym, related meaning).

Each stored link is a **directed** pair: **from → to**, plus a **relation kind**. The kind is either:

- **Unidirectional** — one row (A → B only).
- **Bidirectional** — **two rows** (A → B and B → A) with the same kind, so “what relates to this case?” is always “rows where this case is the **from** side”—no special OR logic.

Create/delete for bidirectional kinds should stay **paired** in the relation repository so the store never holds only half of a symmetric link. Details: [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md).
