import { db } from "@/core/db"
import { studyRecords } from "@/db/schema"
import { eq, inArray } from "drizzle-orm"

export const ReviewStatuses = ["new", "learning", "repeating"] as const

export type ReviewStatusDto = (typeof ReviewStatuses)[number]

export type StudyRecordDto = {
  readonly caseId: string
  readonly reviewStatus: ReviewStatusDto
  readonly dueAt: string | null
  readonly schedulingStrengthNumeric: number
  readonly repetitionsCount: number
  readonly lastRepetitionAt: string | null
  readonly lastGradeNumeric: number | null
}

function mapRow(row: typeof studyRecords.$inferSelect): StudyRecordDto {
  return {
    caseId: row.caseId,
    reviewStatus: row.reviewStatus as ReviewStatusDto,
    dueAt: row.dueAt,
    schedulingStrengthNumeric: row.schedulingStrengthNumeric,
    repetitionsCount: row.repetitionsCount,
    lastRepetitionAt: row.lastRepetitionAt,
    lastGradeNumeric: row.lastGradeNumeric,
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
    await db.insert(studyRecords).values({
      caseId: record.caseId,
      reviewStatus: record.reviewStatus,
      dueAt: record.dueAt,
      schedulingStrengthNumeric: record.schedulingStrengthNumeric,
      repetitionsCount: record.repetitionsCount,
      lastRepetitionAt: record.lastRepetitionAt,
      lastGradeNumeric: record.lastGradeNumeric,
    })
  }

  async upsertStudyRecordDto(record: StudyRecordDto): Promise<void> {
    await db
      .insert(studyRecords)
      .values({
        caseId: record.caseId,
        reviewStatus: record.reviewStatus,
        dueAt: record.dueAt,
        schedulingStrengthNumeric: record.schedulingStrengthNumeric,
        repetitionsCount: record.repetitionsCount,
        lastRepetitionAt: record.lastRepetitionAt,
        lastGradeNumeric: record.lastGradeNumeric,
      })
      .onConflictDoUpdate({
        target: studyRecords.caseId,
        set: {
          reviewStatus: record.reviewStatus,
          dueAt: record.dueAt,
          schedulingStrengthNumeric: record.schedulingStrengthNumeric,
          repetitionsCount: record.repetitionsCount,
          lastRepetitionAt: record.lastRepetitionAt,
          lastGradeNumeric: record.lastGradeNumeric,
        },
      })
  }

}