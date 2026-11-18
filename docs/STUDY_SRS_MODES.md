# Study SRS (levels, locks, modes)

**Status:** Level/points, outcomes, learning-cycle lock, and `streak_count` are **active**. **Study modes** (`struggle`, `freeze`, `berserk`) are **stored in SQLite** but **not implemented** in API/UI (`STUDY_MODES_IMPLEMENTED = false` in `server/src/practice/practice_srs.ts`). Re-enable by flipping that flag and restoring client mode controls.

## `study_records` columns

| Column | Role |
|--------|------|
| `level_numeric`, `points_numeric` | 100 points per level; clamped when applying outcomes |
| `study_mode` | `normal` \| `struggle` \| `freeze` \| `berserk` (persisted; ignored when modes off) |
| `locked_until` | Learning cycle — word deprioritized in pick until this ISO time |
| `mode_until` | Freeze only: copies `locked_until` when freeze was used on a review; blocks re-freeze until expired |
| `streak_count` | Signed streak; negatives are loss streaks; used for berserk multiplier when modes on |

## Outcomes (always active)

| Outcome | Points (base) |
|---------|----------------|
| `dont_know` | −18 |
| `compare_wrong` | −22 |
| `compare_correct` | +28 |

Each outcome sets `locked_until` to now + `learningCycleMs` (from env / settings).

## Modes (documented; disabled in code)

### Struggle

- Manual toggle before review.
- Wins: ×2.5 points; losses: ×0.65.
- Queue weight ×1.85.
- Clears to `normal` after a successful review.

### Freeze

- Once per cycle (`mode_until` cooldown until lock ends).
- That review: no level/point change; after review → `normal`, `mode_until = locked_until`.

### Berserk

- Streak bumps on win/loss (same `streak_count` field).
- Point delta × `1 + min(|streak|, 6) × 0.35`.

### Snapshot hints (when re-enabled)

- `struggleSuggested`: `streak_count <= -3` and `study_mode === normal`
- `freezeAvailable`: no active `mode_until` cooldown and not already in freeze

## API (deferred)

`PATCH /api/practice/cases/:caseId/study-mode` — removed from routes while modes are off; repository `setStudyMode` rejects when `STUDY_MODES_IMPLEMENTED` is false.

## Related code

- `server/src/practice/practice_srs.ts` — outcomes, weights, mode math
- `web_client/src/practice/practice_study_types.ts` — DTO shapes (unchanged)