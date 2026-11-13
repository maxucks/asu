"use client"

import { HttpCaseDataSource } from "@/core/data_sources/http_case_data_source"
import { HttpStudyRecordDataSource } from "@/core/data_sources/http_study_record_data_source"
import type { PracticeCardDto } from "@asu/contracts"
import { PracticeRepository } from "@/practice/practice_repository"
import { PracticeSessionScreenUi } from "@/practice/ui/practice_session_screen_ui"

const queueCardsById = new Map<string, PracticeCardDto>()

export const practiceRepository = new PracticeRepository(
  new HttpStudyRecordDataSource(queueCardsById),
  new HttpCaseDataSource(queueCardsById),
)

export function PracticeSessionProvider() {
  return <PracticeSessionScreenUi practiceRepository={practiceRepository} />
}
