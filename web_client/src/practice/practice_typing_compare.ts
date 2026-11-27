import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import type { TypingInputTarget } from "@/practice/practice_typing_targets"

function normalizeDefault(text: string): string {
  return text.normalize("NFC").trim().replace(/\s+/g, " ")
}

function normalizeLatin(text: string): string {
  return normalizeDefault(text).toLowerCase()
}

function representationTypeNameForTarget(
  target: TypingInputTarget,
  types: readonly RepresentationTypeDto[],
): string | null {
  if (target.kind !== "representation_type") return null
  return types.find((item) => item.id === target.representationTypeId)?.name ?? null
}

function shouldNormalizeLatin(target: TypingInputTarget, types: readonly RepresentationTypeDto[]): boolean {
  if (target.kind === "original") return false
  const name = representationTypeNameForTarget(target, types)?.toLowerCase() ?? ""
  return name === "romaji" || name === "transliteration"
}

export function normalizeTypedAnswer(
  typed: string,
  target: TypingInputTarget,
  types: readonly RepresentationTypeDto[],
): string {
  return shouldNormalizeLatin(target, types) ? normalizeLatin(typed) : normalizeDefault(typed)
}

export function normalizeExpectedAnswer(
  expected: string,
  target: TypingInputTarget,
  types: readonly RepresentationTypeDto[],
): string {
  return shouldNormalizeLatin(target, types) ? normalizeLatin(expected) : normalizeDefault(expected)
}

export function isTypingAnswerCorrect(
  typed: string,
  expected: string,
  target: TypingInputTarget,
  types: readonly RepresentationTypeDto[],
): boolean {
  const left = normalizeTypedAnswer(typed, target, types)
  const right = normalizeExpectedAnswer(expected, target, types)
  if (left.length === 0) return false
  return left === right
}