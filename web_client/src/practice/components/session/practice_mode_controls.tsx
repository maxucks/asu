"use client"

import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import type { PracticeCard } from "@/practice/practice_model"
import { TypingTargetPicker } from "@/practice/components/session/typing_target_picker"
import type { PracticeSessionMode, TypingInputTarget } from "@/practice/practice_typing_targets"

type PracticeModeControlsProps = {
  readonly practiceMode: PracticeSessionMode
  readonly onPracticeMode: (mode: PracticeSessionMode) => void
  readonly typingTarget: TypingInputTarget
  readonly onTypingTarget: (target: TypingInputTarget) => void
  readonly representationTypes: readonly RepresentationTypeDto[]
  readonly eligibleCards: readonly PracticeCard[]
  readonly disabled?: boolean
}

export function PracticeModeControls({
  practiceMode,
  onPracticeMode,
  typingTarget,
  onTypingTarget,
  representationTypes,
  eligibleCards,
  disabled,
}: PracticeModeControlsProps) {
  return (
    <div
      className="fixed top-6 left-6 z-40 flex h-12 max-w-[min(calc(100vw-7rem),22rem)] items-center gap-1.5 rounded-full border border-grid-line bg-card pl-1.5 pr-3 shadow-lg transition hover:border-accent/50 hover:bg-accent-soft/40"
      role="group"
      aria-label="Practice answer mode"
    >
      <div className="inline-flex h-9 shrink-0 items-center rounded-full bg-tile p-0.5">
        <ModeButton
          active={practiceMode === "associations"}
          disabled={disabled}
          onClick={() => onPracticeMode("associations")}
        >
          Recall
        </ModeButton>
        <ModeButton
          active={practiceMode === "typing"}
          disabled={disabled}
          onClick={() => onPracticeMode("typing")}
        >
          Type
        </ModeButton>
      </div>
      {practiceMode === "typing" ? (
        <div className="min-w-0 flex-1 border-l border-grid-line/80 pl-2">
          <TypingTargetPicker
            inline
            typingTarget={typingTarget}
            onTypingTarget={onTypingTarget}
            representationTypes={representationTypes}
            eligibleCards={eligibleCards}
            disabled={disabled}
          />
        </div>
      ) : null}
    </div>
  )
}

function ModeButton({
  active,
  disabled,
  onClick,
  children,
}: {
  readonly active: boolean
  readonly disabled?: boolean
  readonly onClick: () => void
  readonly children: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "bg-accent text-accent-foreground shadow-sm"
          : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}