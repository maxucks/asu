import { asuApiBaseUrl, requestJson } from "@/core/utils/request_json"

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

type StudyRecordsResponse = {
  readonly records: readonly StudyRecordDto[]
}

export class HttpStudyRecordDataSource {
  constructor(private readonly baseUrl: string = asuApiBaseUrl()) {}

  async fetchStudyRecords(languageId: string, categoryId: string | null = null): Promise<readonly StudyRecordDto[]> {
    const categoryQuery = categoryId ? `&categoryId=${encodeURIComponent(categoryId)}` : ""
    const body = await requestJson<StudyRecordsResponse>(
      this.baseUrl,
      "GET",
      `/api/practice/study-records?languageId=${encodeURIComponent(languageId)}${categoryQuery}`,
    )
    return body.records
  }
}