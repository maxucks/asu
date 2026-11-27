import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import {
  normalizeExpectedAnswer,
  normalizeTypedAnswer,
} from "@/practice/practice_typing_compare"
import type { TypingInputTarget } from "@/practice/practice_typing_targets"

export type TypingCharStatus = "correct" | "error"

export function typedLineDisplay(
  typed: string,
  target: TypingInputTarget,
  types: readonly RepresentationTypeDto[],
): string {
  return normalizeTypedAnswer(typed, target, types)
}

export function getTypingCharStatuses(
  typed: string,
  expected: string,
  target: TypingInputTarget,
  types: readonly RepresentationTypeDto[],
): TypingCharStatus[] {
  const normalized = normalizeTypedAnswer(typed, target, types)
  const expectedNorm = normalizeExpectedAnswer(expected, target, types)
  const statuses: TypingCharStatus[] = []

  for (let i = 0; i < normalized.length; i++) {
    statuses.push(
      i < expectedNorm.length && normalized[i] === expectedNorm[i] ? "correct" : "error",
    )
  }
  return statuses
}

export function isTypingComplete(
  typed: string,
  expected: string,
  target: TypingInputTarget,
  types: readonly RepresentationTypeDto[],
): boolean {
  const normalized = normalizeTypedAnswer(typed, target, types)
  const expectedNorm = normalizeExpectedAnswer(expected, target, types)
  return normalized.length > 0 && normalized === expectedNorm
}