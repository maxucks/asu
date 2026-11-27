"use client"

import { useSetHotkeyBindings } from "@/core/hotkeys/hotkey_hints_context"
import { buildPracticeHotkeyBindings } from "@/practice/practice_hotkey_bindings"
import type { PracticeSessionMode } from "@/practice/practice_typing_targets"
import type { PracticeSessionPhase } from "@/practice/practice_session_view_state"
import { useEffect } from "react"

export function usePracticeHotkeyBindings(
  practiceMode: PracticeSessionMode,
  phase: PracticeSessionPhase,
  sessionActive: boolean,
  typingAwaitingNext: boolean,
  editingCase: boolean,
) {
  const setBindings = useSetHotkeyBindings()

  useEffect(() => {
    setBindings(
      buildPracticeHotkeyBindings({
        practiceMode,
        phase,
        sessionActive,
        typingAwaitingNext,
        editingCase,
      }),
    )
    return () => setBindings([])
  }, [editingCase, phase, practiceMode, sessionActive, setBindings, typingAwaitingNext])
}