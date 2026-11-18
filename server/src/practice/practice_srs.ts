import type { StudyModeDto, StudyRecordDto } from "@/core/data_sources/study_record_data_source_drizzle"
import type { PracticeGradeDto } from "@/practice/practice_repository"

/** See docs/STUDY_SRS_MODES.md — DB columns kept; UI/API mode switching off until re-enabled. */
export const STUDY_MODES_IMPLEMENTED = false

export const PracticeOutcomes = ["dont_know", "compare_wrong", "compare_correct"] as const

export type PracticeOutcomeDto = (typeof PracticeOutcomes)[number]

const POINTS_PER_LEVEL = 100

const GRADE_NUMERIC: Record<PracticeGradeDto, number> = {
  hard: 0,
  medium: 1,
  easy: 2,
}

export function practiceGradeToNumeric(grade: PracticeGradeDto): number {
  return GRADE_NUMERIC[grade]
}

export function practiceGradeToOutcome(grade: PracticeGradeDto): PracticeOutcomeDto {
  if (grade === "hard") return "dont_know"
  if (grade === "medium") return "compare_wrong"
  return "compare_correct"
}

export function createInitialStudyRecord(caseId: string): StudyRecordDto {
  return {
    caseId,
    levelNumeric: 0,
    pointsNumeric: 0,
    studyMode: "normal",
    lockedUntil: null,
    modeUntil: null,
    streakCount: 0,
  }
}

export function isStudyRecordLocked(record: StudyRecordDto, now: Date): boolean {
  if (!record.lockedUntil) return false
  const until = Date.parse(record.lockedUntil)
  return !Number.isNaN(until) && until > now.getTime()
}

function isModeCooldownActive(modeUntil: string | null, now: Date): boolean {
  if (!modeUntil) return false
  const until = Date.parse(modeUntil)
  return !Number.isNaN(until) && until > now.getTime()
}

function bumpStreak(streakCount: number, positive: boolean): number {
  if (positive) {
    return streakCount >= 0 ? streakCount + 1 : 1
  }
  return streakCount <= 0 ? streakCount - 1 : -1
}

function clampPoints(level: number, points: number): { level: number; points: number } {
  let nextLevel = level
  let nextPoints = points

  while (nextPoints >= POINTS_PER_LEVEL) {
    nextPoints -= POINTS_PER_LEVEL
    nextLevel += 1
  }

  while (nextPoints < 0) {
    nextPoints += POINTS_PER_LEVEL
    nextLevel -= 1
  }

  return { level: nextLevel, points: nextPoints }
}

function berserkMultiplier(streakCount: number): number {
  const magnitude = Math.min(Math.abs(streakCount), 6)
  if (magnitude === 0) return 1
  return 1 + magnitude * 0.35
}

function applyPointDelta(
  record: StudyRecordDto,
  delta: number,
): Pick<StudyRecordDto, "levelNumeric" | "pointsNumeric"> {
  const adjusted = clampPoints(record.levelNumeric, record.pointsNumeric + delta)
  return { levelNumeric: adjusted.level, pointsNumeric: adjusted.points }
}

export type StudyRecordSnapshotDto = {
  readonly level: number
  readonly points: number
  readonly studyMode: StudyModeDto
  readonly lockedUntil: string | null
  readonly modeUntil: string | null
  readonly struggleSuggested: boolean
  readonly freezeAvailable: boolean
  readonly streakCount: number
  readonly locked: boolean
}

export function toStudyRecordSnapshot(record: StudyRecordDto, now: Date): StudyRecordSnapshotDto {
  const freezeCooldown = isModeCooldownActive(record.modeUntil, now)
  return {
    level: record.levelNumeric,
    points: record.pointsNumeric,
    studyMode: STUDY_MODES_IMPLEMENTED ? record.studyMode : "normal",
    lockedUntil: record.lockedUntil,
    modeUntil: record.modeUntil,
    struggleSuggested:
      STUDY_MODES_IMPLEMENTED && record.streakCount <= -3 && record.studyMode === "normal",
    freezeAvailable:
      STUDY_MODES_IMPLEMENTED && !freezeCooldown && record.studyMode !== "freeze",
    streakCount: record.streakCount,
    locked: isStudyRecordLocked(record, now),
  }
}

export function canEnableFreeze(record: StudyRecordDto, now: Date): boolean {
  if (!STUDY_MODES_IMPLEMENTED) return false
  return toStudyRecordSnapshot(record, now).freezeAvailable
}

export function applyPracticeOutcome(
  record: StudyRecordDto,
  outcome: PracticeOutcomeDto,
  now: Date,
  learningCycleMs: number,
): StudyRecordDto {
  const activeMode: StudyModeDto = STUDY_MODES_IMPLEMENTED ? record.studyMode : "normal"
  const freezeActive = STUDY_MODES_IMPLEMENTED && activeMode === "freeze"

  const positive = outcome === "compare_correct"
  const negative = outcome === "dont_know" || outcome === "compare_wrong"

  let pointDelta = 0
  if (outcome === "dont_know") pointDelta = -18
  else if (outcome === "compare_wrong") pointDelta = -22
  else pointDelta = 28

  let studyMode: StudyModeDto = activeMode
  if (STUDY_MODES_IMPLEMENTED && positive && studyMode === "struggle") studyMode = "normal"

  let streakCount = record.streakCount
  if (positive) streakCount = bumpStreak(streakCount, true)
  else if (negative) streakCount = bumpStreak(streakCount, false)

  if (STUDY_MODES_IMPLEMENTED && studyMode === "struggle") {
    pointDelta = pointDelta > 0 ? Math.round(pointDelta * 2.5) : Math.round(pointDelta * 0.65)
  }

  if (STUDY_MODES_IMPLEMENTED && studyMode === "berserk") {
    pointDelta = Math.round(pointDelta * berserkMultiplier(streakCount))
  }

  let levelNumeric = record.levelNumeric
  let pointsNumeric = record.pointsNumeric

  if (!freezeActive) {
    const applied = applyPointDelta(record, pointDelta)
    levelNumeric = applied.levelNumeric
    pointsNumeric = applied.pointsNumeric
  }

  const lockedUntil = new Date(now.getTime() + learningCycleMs).toISOString()
  let modeUntil: string | null = record.modeUntil

  if (STUDY_MODES_IMPLEMENTED && freezeActive) {
    modeUntil = lockedUntil
    studyMode = "normal"
  } else if (!STUDY_MODES_IMPLEMENTED) {
    studyMode = record.studyMode
    modeUntil = record.modeUntil
  }

  return {
    ...record,
    levelNumeric,
    pointsNumeric,
    studyMode,
    streakCount,
    lockedUntil,
    modeUntil,
  }
}

/** @deprecated use applyPracticeOutcome */
export function applyPracticeGrade(record: StudyRecordDto, grade: PracticeGradeDto, now: Date): StudyRecordDto {
  return applyPracticeOutcome(record, practiceGradeToOutcome(grade), now, 240 * 60_000)
}

export function computePracticeCaseWeight(record: StudyRecordDto | undefined, now: Date): number {
  if (!record) {
    return (90 + Math.random() * 35) * (0.85 + Math.random() * 0.3)
  }

  if (isStudyRecordLocked(record, now)) {
    return 0
  }

  const level = record.levelNumeric
  let weight = 42 + Math.max(0, 8 - level) * 9 + Math.max(0, -level) * 14

  if (STUDY_MODES_IMPLEMENTED && record.studyMode === "struggle") {
    weight *= 1.85
  }

  weight *= 0.75 + Math.random() * 0.5
  return Math.max(1, weight)
}

export function pickNextPracticeCaseId(
  caseIds: readonly string[],
  recordByCaseId: ReadonlyMap<string, StudyRecordDto>,
  now: Date,
  excludeCaseId: string | null,
): string {
  if (caseIds.length === 0) {
    throw new Error("No cases")
  }

  const candidates = excludeCaseId ? caseIds.filter((id) => id !== excludeCaseId) : [...caseIds]

  const unlocked = candidates.filter((id) => {
    const record = recordByCaseId.get(id)
    return !record || !isStudyRecordLocked(record, now)
  })

  const pool = unlocked.length > 0 ? unlocked : [...caseIds]

  const weighted = pool.map((id) => ({
    id,
    weight: computePracticeCaseWeight(recordByCaseId.get(id), now),
  }))

  const total = weighted.reduce((sum, item) => sum + item.weight, 0)
  let roll = Math.random() * total

  for (const item of weighted) {
    roll -= item.weight
    if (roll <= 0) {
      return item.id
    }
  }

  return weighted[weighted.length - 1]!.id
}

export function shuffleCaseIds<T extends string>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!]
  }
  return copy
}