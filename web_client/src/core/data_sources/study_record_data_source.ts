/** Serialized study-record / SRS queue rows at the persistence boundary. */

export const REVIEW_STATUSES = ["new", "learning", "repeating"] as const;

export type ReviewStatusDto = (typeof REVIEW_STATUSES)[number];

export type StudyRecordDto = {
  readonly caseId: string;
  readonly reviewStatus: ReviewStatusDto;
  readonly dueAt: string | null;
};

/**
 * Driver for study-record / queue storage: list due rows, read/write SRS fields;
 * serialize ↔ DTOs. Failures throw.
 */
export interface StudyRecordDataSource {
  listDueStudyRecordDtos(): Promise<readonly StudyRecordDto[]>;
}
