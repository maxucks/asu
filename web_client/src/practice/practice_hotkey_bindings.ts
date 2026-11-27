import type { HotkeyBinding } from "@/core/hotkeys/hotkey_types"
import type { PracticeSessionMode } from "@/practice/practice_typing_targets"
import type { PracticeSessionPhase } from "@/practice/practice_session_view_state"

export type PracticeHotkeyBindingsInput = {
  readonly practiceMode: PracticeSessionMode
  readonly phase: PracticeSessionPhase
  readonly sessionActive: boolean
  readonly typingAwaitingNext: boolean
  readonly editingCase: boolean
}

export function buildPracticeHotkeyBindings(input: PracticeHotkeyBindingsInput): readonly HotkeyBinding[] {
  if (!input.sessionActive || input.editingCase) {
    return []
  }

  if (input.practiceMode === "associations") {
    if (input.phase === "front") {
      return [{ id: "recall-enter-reveal", keys: ["Enter"], label: "Show answer" }]
    }

    return [
      { id: "recall-grade-hard", keys: ["1"], label: "Hard" },
      { id: "recall-grade-medium", keys: ["2"], label: "Medium" },
      { id: "recall-grade-easy", keys: ["3"], label: "Easy" },
      { id: "recall-enter-easy", keys: ["Enter"], label: "Next (Easy)" },
      { id: "recall-shift-hard", keys: ["Shift", "Enter"], label: "Hard" },
    ]
  }

  if (input.typingAwaitingNext) {
    return [{ id: "typing-enter-next", keys: ["Enter"], label: "Next" }]
  }

  if (input.phase === "front") {
    return [{ id: "typing-tab-skip", keys: ["Tab"], label: "Skip" }]
  }

  return []
}