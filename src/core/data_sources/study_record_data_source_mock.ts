import type {
  StudyRecordDataSource,
  StudyRecordDto,
} from "@/core/data_sources/study_record_data_source";

const MOCK_DUE_QUEUE: readonly StudyRecordDto[] = [
  {
    caseId: "case-1",
    reviewStatus: "repeating",
    dueAt: "2026-03-10T09:00:00.000Z",
  },
  {
    caseId: "case-2",
    reviewStatus: "learning",
    dueAt: "2026-03-10T09:05:00.000Z",
  },
  {
    caseId: "case-3",
    reviewStatus: "new",
    dueAt: null,
  },
] as const satisfies readonly StudyRecordDto[];

export class MockStudyRecordDataSource implements StudyRecordDataSource {
  async listDueStudyRecordDtos(): Promise<readonly StudyRecordDto[]> {
    return MOCK_DUE_QUEUE;
  }
}
