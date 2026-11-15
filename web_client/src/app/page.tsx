"use client";

import { HttpCaseDataSource } from "@/core/data_sources/http_case_data_source";
import type { PracticeCardDto } from "@/practice/practice_repository";
import { PracticeRepository } from "@/practice/practice_repository";
import { PracticeSessionScreenUi } from "@/practice/ui/practice_session_screen_ui";

const queueCardsById = new Map<string, PracticeCardDto>();

const practiceRepository = new PracticeRepository(new HttpCaseDataSource(queueCardsById));

export default function HomePage() {
  return <PracticeSessionScreenUi practiceRepository={practiceRepository} />;
}