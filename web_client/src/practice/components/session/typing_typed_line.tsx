"use client"

import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import { normalizeExpectedAnswer } from "@/practice/practice_typing_compare"
import {
  getTypingCharStatuses,
  typedLineDisplay,
  type TypingCharStatus,
} from "@/practice/practice_typing_live"
import type { TypingInputTarget } from "@/practice/practice_typing_targets"

const STATUS_CLASS: Record<TypingCharStatus, string> = {
  correct: "text-muted",
  error: "text-danger",
}

type TypingTypedLineProps = {
  readonly typed: string
  readonly expected: string
  readonly target: TypingInputTarget
  readonly representationTypes: readonly RepresentationTypeDto[]
}

export function TypingTypedLine({ typed, expected, target, representationTypes }: TypingTypedLineProps) {
  const expectedNorm = normalizeExpectedAnswer(expected, target, representationTypes)
  const display = typedLineDisplay(typed, target, representationTypes)
  const statuses = getTypingCharStatuses(typed, expected, target, representationTypes)

  if (expectedNorm.length === 0) {
    return (
      <p className="min-h-8 font-mono text-xl tracking-wide text-muted" aria-label="Your answer">
        —
      </p>
    )
  }

  return (
    <p className="min-h-8 font-mono text-xl tracking-wide text-foreground" aria-label="Your answer">
      {Array.from({ length: expectedNorm.length }, (_, index) => {
        if (index < display.length) {
          return (
            <span key={index} className={STATUS_CLASS[statuses[index] ?? "correct"]}>
              {display[index]}
            </span>
          )
        }
        return (
          <span key={index} className="text-muted/60">
            ·
          </span>
        )
      })}
      {display.length > expectedNorm.length
        ? display.slice(expectedNorm.length).split("").map((char, offset) => (
            <span key={`extra-${offset}`} className="text-danger">
              {char}
            </span>
          ))
        : null}
    </p>
  )
}