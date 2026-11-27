"use client"

import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import {
  coerceTypingTargetForLanguage,
  parseTypingTargetJson,
  type PracticeSessionMode,
  serializeTypingTarget,
  type TypingInputTarget,
} from "@/practice/practice_typing_targets"
import { useCallback, useEffect, useState } from "react"

const ModeStorageKey = "asu_practice_mode"
const TargetStorageKeyPrefix = "asu_typing_target_"

function readStoredMode(): PracticeSessionMode {
  if (typeof window === "undefined") return "associations"
  const raw = window.localStorage.getItem(ModeStorageKey)
  return raw === "typing" ? "typing" : "associations"
}

function readStoredTarget(languageId: string): TypingInputTarget {
  if (typeof window === "undefined") return { kind: "original" }
  const raw = window.localStorage.getItem(`${TargetStorageKeyPrefix}${languageId}`)
  return parseTypingTargetJson(raw) ?? { kind: "original" }
}

export function usePracticeModePreference(languageId: string, representationTypes: readonly RepresentationTypeDto[]) {
  const [practiceMode, setPracticeModeState] = useState<PracticeSessionMode>("associations")
  const [typingTarget, setTypingTargetState] = useState<TypingInputTarget>({ kind: "original" })

  useEffect(() => {
    setPracticeModeState(readStoredMode())
    setTypingTargetState(
      coerceTypingTargetForLanguage(readStoredTarget(languageId), representationTypes),
    )
  }, [languageId, representationTypes])

  const setPracticeMode = useCallback((mode: PracticeSessionMode) => {
    setPracticeModeState(mode)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ModeStorageKey, mode)
    }
  }, [])

  const setTypingTarget = useCallback(
    (target: TypingInputTarget) => {
      const next = coerceTypingTargetForLanguage(target, representationTypes)
      setTypingTargetState(next)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(`${TargetStorageKeyPrefix}${languageId}`, serializeTypingTarget(next))
      }
    },
    [languageId, representationTypes],
  )

  return { practiceMode, setPracticeMode, typingTarget, setTypingTarget }
}