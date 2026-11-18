import { db } from "@/core/db"
import { studyRecords } from "@/db/schema"
import { eq, inArray } from "drizzle-orm"

export const StudyModes = ["normal", "struggle", "freeze", "berserk"] as const

export type StudyModeDto = (typeof StudyModes)[number]

export type StudyRecordDto = {
  readonly caseId: string
  readonly levelNumeric: number
  readonly pointsNumeric: number
  readonly studyMode: StudyModeDto
  readonly lockedUntil: string | null
  readonly modeUntil: string | null
  readonly streakCount: number
}

function mapRow(row: typeof studyRecords.$inferSelect): StudyRecordDto {
  const mode = row.studyMode as StudyModeDto
  return {
    caseId: row.caseId,
    levelNumeric: row.levelNumeric,
    pointsNumeric: row.pointsNumeric,
    studyMode: StudyModes.includes(mode) ? mode : "normal",
    lockedUntil: row.lockedUntil,
    modeUntil: row.modeUntil,
    streakCount: row.streakCount,
  }
}

function rowValues(record: StudyRecordDto) {
  return {
    caseId: record.caseId,
    levelNumeric: record.levelNumeric,
    pointsNumeric: record.pointsNumeric,
    studyMode: record.studyMode,
    lockedUntil: record.lockedUntil,
    modeUntil: record.modeUntil,
    streakCount: record.streakCount,
  }
}

export class DrizzleStudyRecordDataSource {
  async listStudyRecordDtosByCaseIds(caseIds: readonly string[]): Promise<readonly StudyRecordDto[]> {
    if (caseIds.length === 0) return []

    const rows = await db.select().from(studyRecords).where(inArray(studyRecords.caseId, [...caseIds]))
    return rows.map(mapRow)
  }

  async getStudyRecordDtoByCaseId(caseId: string): Promise<StudyRecordDto | null> {
    const rows = await db.select().from(studyRecords).where(eq(studyRecords.caseId, caseId)).limit(1)
    const row = rows[0]
    return row ? mapRow(row) : null
  }

  async insertStudyRecordDto(record: StudyRecordDto): Promise<void> {
    await db.insert(studyRecords).values(rowValues(record))
  }

  async upsertStudyRecordDto(record: StudyRecordDto): Promise<void> {
    const values = rowValues(record)
    await db
      .insert(studyRecords)
      .values(values)
      .onConflictDoUpdate({
        target: studyRecords.caseId,
        set: values,
      })
  }
}