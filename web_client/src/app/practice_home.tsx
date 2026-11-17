"use client";

import { HttpCaseDataSource } from "@/core/data_sources/http_case_data_source";
import { HttpLanguageDataSource } from "@/core/data_sources/http_language_data_source";
import { SessionScreen } from "@/practice/components/session/session_screen";
import { PracticeContextProvider } from "@/practice/context/practice_context";
import type { PracticeContextValue } from "@/practice/practice_context_value";
import { HttpCategoryDataSource } from "@/core/data_sources/http_category_data_source";
import {
  readStoredCategoryId,
  writeStoredCategoryId,
} from "@/practice/practice_category_storage";
import {
  DEFAULT_LANGUAGE_ID,
  readStoredLanguageId,
  writeStoredLanguageId,
} from "@/practice/practice_language";
import { PracticeRepository, type PracticeCardDto } from "@/practice/practice_repository";
import { useCallback, useEffect, useMemo, useState } from "react";

const queueCardsById = new Map<string, PracticeCardDto>();

export function PracticeHome() {
  const [activeLanguageId, setActiveLanguageIdState] = useState(DEFAULT_LANGUAGE_ID);
  const [activeCategoryId, setActiveCategoryIdState] = useState<string | null>(null);

  useEffect(() => {
    const languageId = readStoredLanguageId() ?? DEFAULT_LANGUAGE_ID;
    setActiveLanguageIdState(languageId);
    setActiveCategoryIdState(readStoredCategoryId(languageId));
  }, []);

  const setActiveLanguageId = useCallback((languageId: string) => {
    writeStoredLanguageId(languageId);
    setActiveLanguageIdState(languageId);
    const storedCategory = readStoredCategoryId(languageId);
    setActiveCategoryIdState(storedCategory);
  }, []);

  const setActiveCategoryId = useCallback(
    (categoryId: string | null) => {
      writeStoredCategoryId(activeLanguageId, categoryId);
      setActiveCategoryIdState(categoryId);
    },
    [activeLanguageId],
  );

  const value = useMemo((): PracticeContextValue => {
    const repo = new PracticeRepository(
      new HttpCaseDataSource(queueCardsById),
      new HttpLanguageDataSource(),
      new HttpCategoryDataSource(),
    );
    return { repo, activeLanguageId, setActiveLanguageId, activeCategoryId, setActiveCategoryId };
  }, [activeLanguageId, setActiveLanguageId, activeCategoryId, setActiveCategoryId]);

  return (
    <PracticeContextProvider value={value}>
      <SessionScreen />
    </PracticeContextProvider>
  );
}