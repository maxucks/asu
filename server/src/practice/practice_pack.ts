import type { PracticeGradeDto } from "@/practice/practice_repository"
import type { StudyRecordDto } from "@/core/data_sources/study_record_data_source_drizzle"
import { shuffleCaseIds } from "@/practice/practice_srs"

/** Order items so neighboring entries differ; optional prefix tail id to avoid at the join. */
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

const GRADE_REPEAT_INSERTS: Record<PracticeGradeDto, number> = {
  hard: 3,
  medium: 1,
  easy: 0,
}

/** Extra appearances in a shuffled pack (beyond the mandatory one per case). */
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