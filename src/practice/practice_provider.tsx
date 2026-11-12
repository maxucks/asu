"use client";

import { MockCaseDataSource } from "@/core/data_sources/case_data_source_mock";
import { MockStudyRecordDataSource } from "@/core/data_sources/study_record_data_source_mock";
import { PracticeRepository } from "@/practice/practice_repository";
import { PracticeSessionScreenUi } from "@/practice/ui/practice_session_screen_ui";

export const practiceRepository = new PracticeRepository(
  new MockStudyRecordDataSource(),
  new MockCaseDataSource(),
);

export function PracticeSessionProvider() {
  return <PracticeSessionScreenUi practiceRepository={practiceRepository} />;
}
