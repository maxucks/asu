import type { PracticeGradeDto } from "@/practice/practice_repository"
import type { StudyRecordDto } from "@/core/data_sources/study_record_data_source_drizzle"

const MS_MINUTE = 60_000
const MS_HOUR = 60 * MS_MINUTE
const MS_DAY = 24 * MS_HOUR

const LEARNING_DELAY_MS: Record<PracticeGradeDto, number> = {
  hard: 10 * MS_MINUTE,
  medium: MS_HOUR,
  easy: 4 * MS_HOUR,
}

const GRADE_NUMERIC: Record<PracticeGradeDto, number> = {
  hard: 0,
  medium: 1,
  easy: 2,
}

export function practiceGradeToNumeric(grade: PracticeGradeDto): number {
  return GRADE_NUMERIC[grade]
}

export function createInitialStudyRecord(caseId: string): StudyRecordDto {
  return {
    caseId,
    reviewStatus: "new",
    dueAt: null,
    schedulingStrengthNumeric: 0,
    repetitionsCount: 0,
    lastRepetitionAt: null,
    lastGradeNumeric: null,
  }
}

export function applyPracticeGrade(record: StudyRecordDto, grade: PracticeGradeDto, now: Date): StudyRecordDto {
  const gradeNumeric = practiceGradeToNumeric(grade)
  const repetitionsCount = record.repetitionsCount + 1
  let reviewStatus = record.reviewStatus
  let schedulingStrengthNumeric = record.schedulingStrengthNumeric

  if (reviewStatus === "new") {
    reviewStatus = "learning"
  }

  if (reviewStatus === "learning") {
    if (grade === "easy") {
      reviewStatus = "repeating"
      schedulingStrengthNumeric = Math.max(1, schedulingStrengthNumeric + 1)
    } else if (grade === "medium" && repetitionsCount >= 2) {
      reviewStatus = "repeating"
      schedulingStrengthNumeric = Math.max(1, schedulingStrengthNumeric + 1)
    }
  } else if (reviewStatus === "repeating") {
    if (grade === "hard") {
      reviewStatus = "learning"
      schedulingStrengthNumeric = Math.max(0, schedulingStrengthNumeric - 1)
    } else if (grade === "easy") {
      schedulingStrengthNumeric += 1
    } else if (grade === "medium") {
      schedulingStrengthNumeric = Math.max(0, schedulingStrengthNumeric)
    }
  }

  const dueAt = computeDueAt(reviewStatus, grade, schedulingStrengthNumeric, now)

  return {
    ...record,
    reviewStatus,
    schedulingStrengthNumeric,
    repetitionsCount,
    lastRepetitionAt: now.toISOString(),
    lastGradeNumeric: gradeNumeric,
    dueAt,
  }
}

function computeDueAt(
  reviewStatus: StudyRecordDto["reviewStatus"],
  grade: PracticeGradeDto,
  strength: number,
  now: Date,
): string {
  if (reviewStatus === "learning") {
    return new Date(now.getTime() + LEARNING_DELAY_MS[grade]).toISOString()
  }

  const capped = Math.min(Math.max(strength, 1), 12)
  const baseDays = Math.pow(2, capped - 1)
  const factor = grade === "easy" ? 1.5 : grade === "medium" ? 1 : 0.6
  const days = Math.max(1, Math.round(baseDays * factor))
  return new Date(now.getTime() + days * MS_DAY).toISOString()
}

/** Weighted rank: higher = more likely in infinite practice (new boosted, due + time since last rep). */
export function computePracticeCaseWeight(record: StudyRecordDto | undefined, now: Date): number {
  if (!record || record.reviewStatus === "new") {
    return (105 + Math.random() * 30) * (0.85 + Math.random() * 0.3)
  }

  const nowMs = now.getTime()
  const dueMs = record.dueAt ? Date.parse(record.dueAt) : null
  const lastMs = record.lastRepetitionAt ? Date.parse(record.lastRepetitionAt) : null

  let weight = 0

  if (record.reviewStatus === "learning") {
    weight = 58
    if (dueMs !== null && !Number.isNaN(dueMs) && dueMs <= nowMs) {
      weight += 48
    }
  } else if (record.reviewStatus === "repeating") {
    weight = 16
    if (dueMs !== null && !Number.isNaN(dueMs) && dueMs <= nowMs) {
      const overdueHours = Math.max(0, (nowMs - dueMs) / MS_HOUR)
      weight += 30 + Math.min(45, overdueHours * 2)
    }
  }

  if (lastMs !== null && !Number.isNaN(lastMs)) {
    const minutesSince = Math.max(0, (nowMs - lastMs) / MS_MINUTE)
    weight += Math.min(38, minutesSince / 2.5)
  } else {
    weight += 28
  }

  if (record.repetitionsCount <= 1) {
    weight += 18
  }

  weight *= 0.7 + Math.random() * 0.55

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
  const pool = candidates.length > 0 ? candidates : [...caseIds]

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

type QueueBucket = {
  readonly id: string
  readonly dueMs: number | null
}

export function buildPracticeQueueCaseIds(
  caseIds: readonly string[],
  recordByCaseId: ReadonlyMap<string, StudyRecordDto>,
  now: Date,
  shuffleNew: (ids: readonly string[]) => string[],
): string[] {
  const nowMs = now.getTime()
  const due: QueueBucket[] = []
  const learning: QueueBucket[] = []
  const fresh: string[] = []

  for (const caseId of caseIds) {
    const record = recordByCaseId.get(caseId)
    if (!record || record.reviewStatus === "new") {
      fresh.push(caseId)
      continue
    }

    const dueMs = record.dueAt ? Date.parse(record.dueAt) : null

    if (record.reviewStatus === "repeating") {
      if (dueMs !== null && !Number.isNaN(dueMs) && dueMs <= nowMs) {
        due.push({ id: caseId, dueMs })
      }
      continue
    }

    if (record.reviewStatus === "learning") {
      if (dueMs !== null && !Number.isNaN(dueMs) && dueMs <= nowMs) {
        due.push({ id: caseId, dueMs })
      } else {
        learning.push({ id: caseId, dueMs })
      }
    }
  }

  due.sort((left, right) => (left.dueMs ?? 0) - (right.dueMs ?? 0))

  learning.sort((left, right) => {
    if (left.dueMs === null && right.dueMs === null) return 0
    if (left.dueMs === null) return 1
    if (right.dueMs === null) return -1
    return left.dueMs - right.dueMs
  })

  return [...due.map((item) => item.id), ...learning.map((item) => item.id), ...shuffleNew(fresh)]
}

export function shuffleCaseIds<T extends string>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!]
  }
  return copy
}