"use client"

import type { CaseRepresentationDto } from "@/core/data_sources/http_case_data_source"
import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import {
  coercePracticeEntryContextSelection,
  defaultPracticeEntryContextSelection,
  parsePracticeEntryContextSelection,
  type PracticeEntryContextSelection,
  serializePracticeEntryContextSelection,
} from "@/practice/practice_entry_context"
import { useCallback, useEffect, useState } from "react"

const storageKeyPrefix = "asu_practice_entry_context_"

function readStoredSelection(languageId: string): PracticeEntryContextSelection {
  if (typeof window === "undefined") return defaultPracticeEntryContextSelection
  return (
    parsePracticeEntryContextSelection(window.localStorage.getItem(`${storageKeyPrefix}${languageId}`)) ??
    defaultPracticeEntryContextSelection
  )
}

type CoerceCard = {
  readonly value: string
  readonly meaning?: string | null
  readonly representations?: readonly CaseRepresentationDto[]
}

export function usePracticeEntryContextPreference(
  languageId: string,
  representationTypes: readonly RepresentationTypeDto[],
  card: CoerceCard | null,
) {
  const [selection, setSelectionState] = useState<PracticeEntryContextSelection>(defaultPracticeEntryContextSelection)

  useEffect(() => {
    setSelectionState(readStoredSelection(languageId))
  }, [languageId])

  useEffect(() => {
    if (!card) return
    setSelectionState((current) => coercePracticeEntryContextSelection(current, card, representationTypes))
  }, [card, representationTypes])

  const setSelection = useCallback(
    (next: PracticeEntryContextSelection) => {
      const coerced = card
        ? coercePracticeEntryContextSelection(next, card, representationTypes)
        : next
      setSelectionState(coerced)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          `${storageKeyPrefix}${languageId}`,
          serializePracticeEntryContextSelection(coerced),
        )
      }
    },
    [card, languageId, representationTypes],
  )

  return { selection, setSelection }
}