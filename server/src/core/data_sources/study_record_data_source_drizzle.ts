import type { ReviewStatusDto, StudyRecordDto } from "@asu/contracts"
import { db } from "@/core/db"
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
