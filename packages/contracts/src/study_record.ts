export const ReviewStatuses = ["new", "learning", "repeating"] as const

export type ReviewStatusDto = (typeof ReviewStatuses)[number]

export type StudyRecordDto = {
  readonly caseId: string
  readonly reviewStatus: ReviewStatusDto
  readonly dueAt: string | null
}
