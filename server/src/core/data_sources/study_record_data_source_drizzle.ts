import { db } from "@/core/db"

export const ReviewStatuses = ["new", "learning", "repeating"] as const

export type ReviewStatusDto = (typeof ReviewStatuses)[number]

export type StudyRecordDto = {
  readonly caseId: string
  readonly reviewStatus: ReviewStatusDto
  readonly dueAt: string | null
}
import { studyRecords } from "@/db/schema"
export class DrizzleStudyRecordDataSource {
  async listDueStudyRecordDtos(): Promise<readonly StudyRecordDto[]> {
    const rows = await db.select().from(studyRecords)

    return rows.map(
      (row): StudyRecordDto => ({
        caseId: row.caseId,
        reviewStatus: row.reviewStatus as ReviewStatusDto,
        dueAt: row.dueAt,
      }),
    )
  }
}
