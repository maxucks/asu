"use client";

import { HttpCaseDataSource } from "@/core/data_sources/http_case_data_source";
import { SessionScreen } from "@/practice/components/session/session_screen";
import { practiceContext } from "@/practice/context/practice_context";
import type { PracticeContextValue } from "@/practice/practice_context_value";
import { PracticeRepository, type PracticeCardDto } from "@/practice/practice_repository";
import { useMemo } from "react";

const queueCardsById = new Map<string, PracticeCardDto>();

export default function HomePage() {
  const value = useMemo((): PracticeContextValue => {
    const repo = new PracticeRepository(new HttpCaseDataSource(queueCardsById));
    return { repo };
  }, []);

  return (
    <practiceContext.Provider value={value}>
      <SessionScreen />
    </practiceContext.Provider>
  );
}