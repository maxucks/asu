import type { StudyRecordDto } from "@/core/data_sources/http_study_record_data_source"
import type { PracticeGradeDto } from "@/practice/practice_repository"

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

const GRADE_REPEAT_INSERTS: Record<PracticeGradeDto, number> = {
  hard: 3,
  medium: 1,
  easy: 0,
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
  const gradeNumeric = GRADE_NUMERIC[grade]
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

export function shuffleCaseIds<T extends string>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!]
  }
  return copy
}

export function arrangeNoAdjacentDuplicates(
  items: readonly string[],
  avoidAfter?: string | null,
): string[] {
  if (items.length === 0) return []

  const counts = new Map<string, number>()
  for (const id of items) counts.set(id, (counts.get(id) ?? 0) + 1)

  const result: string[] = []
  let last: string | null = avoidAfter ?? null

  while (result.length < items.length) {
    const candidates = [...counts.entries()]
      .filter(([id, count]) => count > 0 && id !== last)
      .sort((left, right) => right[1] - left[1])

    const pick =
      candidates[0] ??
      [...counts.entries()]
        .filter(([, count]) => count > 0)
        .sort((left, right) => right[1] - left[1])[0]

    if (!pick) break

    const [caseId, remaining] = pick
    result.push(caseId)
    counts.set(caseId, remaining - 1)
    last = caseId
  }

  return result
}

export function computePackExtraCopies(record: StudyRecordDto | undefined): number {
  if (!record || record.reviewStatus === "new") {
    return 0
  }

  let extra = 0

  if (record.lastGradeNumeric === 0) extra += 2
  else if (record.lastGradeNumeric === 1) extra += 1

  if (record.reviewStatus === "learning") extra += 1

  if (record.reviewStatus === "repeating" && record.dueAt) {
    const dueMs = Date.parse(record.dueAt)
    if (!Number.isNaN(dueMs) && dueMs <= Date.now()) extra += 1
  }

  if (record.schedulingStrengthNumeric <= 1) extra += 1

  return Math.min(extra, 4)
}

export function buildPracticePackRound(
  caseIds: readonly string[],
  recordByCaseId: ReadonlyMap<string, StudyRecordDto>,
): string[] {
  if (caseIds.length === 0) return []

  const base = shuffleCaseIds([...caseIds])
  const repeats: string[] = []
  for (const caseId of caseIds) {
    const extra = computePackExtraCopies(recordByCaseId.get(caseId))
    for (let copy = 0; copy < extra; copy += 1) {
      repeats.push(caseId)
    }
  }

  if (repeats.length === 0) return base

  const lastBase = base[base.length - 1] ?? null
  const orderedRepeats = arrangeNoAdjacentDuplicates(repeats, lastBase)
  return [...base, ...orderedRepeats]
}

export function injectPracticePackGradeRepeats(
  queue: readonly string[],
  currentIndex: number,
  caseId: string,
  grade: PracticeGradeDto,
): string[] {
  const insertCount = GRADE_REPEAT_INSERTS[grade]
  if (insertCount === 0) return [...queue]

  const head = queue.slice(0, currentIndex + 1)
  const rest = queue.slice(currentIndex + 1)
  const newRepeats = Array.from({ length: insertCount }, () => caseId)
  const lastBeforeRepeats = rest.length > 0 ? (rest[rest.length - 1] ?? null) : (head[head.length - 1] ?? null)
  const orderedRepeats = arrangeNoAdjacentDuplicates(newRepeats, lastBeforeRepeats)

  return [...head, ...rest, ...orderedRepeats]
}

export function studyRecordsToMap(records: readonly StudyRecordDto[]): Map<string, StudyRecordDto> {
  return new Map(records.map((record) => [record.caseId, record]))
}

export function cardIndexForCaseId(cards: readonly { readonly id: string }[], caseId: string | undefined): number {
  if (!caseId) return 0
  const index = cards.findIndex((card) => card.id === caseId)
  return index >= 0 ? index : 0
}