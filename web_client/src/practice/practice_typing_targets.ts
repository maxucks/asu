import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import type { PracticeCard } from "@/practice/practice_model"
import { parseCaseValue } from "@/practice/practice_model"
import { formatRepresentationTypeLabel } from "@/practice/practice_representation"

export type PracticeSessionMode = "associations" | "typing"

export type TypingInputTarget =
  | { readonly kind: "original" }
  | { readonly kind: "representation_type"; readonly representationTypeId: number }

export function typingTargetFromRepresentationType(type: RepresentationTypeDto): TypingInputTarget {
  return { kind: "representation_type", representationTypeId: type.id }
}

export function typingTargetLabel(
  target: TypingInputTarget,
  types: readonly RepresentationTypeDto[],
): string {
  if (target.kind === "original") return "Original"
  const match = types.find((item) => item.id === target.representationTypeId)
  return match ? formatRepresentationTypeLabel(match.name) : "Representation"
}

export function expectedStringForTypingTarget(
  card: PracticeCard,
  target: TypingInputTarget,
): string | null {
  if (target.kind === "original") {
    return parseCaseValue(card.value)
  }
  const row = card.representations.find((item) => item.representationTypeId === target.representationTypeId)
  if (!row) return null
  const trimmed = row.value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function caseSupportsTypingTarget(card: PracticeCard, target: TypingInputTarget): boolean {
  return expectedStringForTypingTarget(card, target) !== null
}

export function filterCardsForTypingTarget(
  cards: readonly PracticeCard[],
  target: TypingInputTarget,
): PracticeCard[] {
  return cards.filter((card) => caseSupportsTypingTarget(card, target))
}

export function resolvePracticeCardsForMode(
  cards: readonly PracticeCard[],
  mode: PracticeSessionMode,
  target: TypingInputTarget,
): readonly PracticeCard[] {
  if (mode === "associations") return cards
  return filterCardsForTypingTarget(cards, target)
}

export function parseTypingTargetJson(raw: string | null): TypingInputTarget | null {
  if (!raw) return null
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== "object" || data === null) return null
    const kind = (data as { kind?: string }).kind
    if (kind === "original") return { kind: "original" }
    if (kind === "representation_type") {
      const id = (data as { representationTypeId?: number }).representationTypeId
      if (typeof id === "number" && Number.isFinite(id)) {
        return { kind: "representation_type", representationTypeId: id }
      }
    }
    return null
  } catch {
    return null
  }
}

export function serializeTypingTarget(target: TypingInputTarget): string {
  return JSON.stringify(target)
}

export function coerceTypingTargetForLanguage(
  target: TypingInputTarget,
  types: readonly RepresentationTypeDto[],
): TypingInputTarget {
  if (target.kind === "original") return target
  const allowed = types.some((item) => item.id === target.representationTypeId)
  return allowed ? target : { kind: "original" }
}