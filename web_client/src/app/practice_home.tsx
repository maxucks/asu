"use client";

import { HttpCaseDataSource } from "@/core/data_sources/http_case_data_source";
import { HttpLanguageDataSource } from "@/core/data_sources/http_language_data_source";
import { SessionScreen } from "@/practice/components/session/session_screen";
import { PracticeContextProvider } from "@/practice/context/practice_context";
import type { PracticeContextValue } from "@/practice/practice_context_value";
import {
  DEFAULT_LANGUAGE_ID,
  readStoredLanguageId,
  writeStoredLanguageId,
} from "@/practice/practice_language";
import { PracticeRepository, type PracticeCardDto } from "@/practice/practice_repository";
import { useCallback, useMemo, useState } from "react";

const queueCardsById = new Map<string, PracticeCardDto>();

export function PracticeHome() {
  const [activeLanguageId, setActiveLanguageIdState] = useState(
    () => readStoredLanguageId() ?? DEFAULT_LANGUAGE_ID,
  );

  const setActiveLanguageId = useCallback((languageId: string) => {
    writeStoredLanguageId(languageId);
    setActiveLanguageIdState(languageId);
  }, []);

  const value = useMemo((): PracticeContextValue => {
    const repo = new PracticeRepository(
      new HttpCaseDataSource(queueCardsById),
      new HttpLanguageDataSource(),
    );
    return { repo, activeLanguageId, setActiveLanguageId };
  }, [activeLanguageId, setActiveLanguageId]);

  return (
    <PracticeContextProvider value={value}>
      <SessionScreen />
    </PracticeContextProvider>
  );
}