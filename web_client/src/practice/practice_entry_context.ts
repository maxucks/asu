import type { CaseRepresentationDto } from "@/core/data_sources/http_case_data_source"
import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import { caseEntryMeaningFieldLabel, caseEntryValueFieldLabel } from "@/practice/practice_case_entry_fields"
import { formatRepresentationTypeLabel, nonEmptyCaseRepresentations } from "@/practice/practice_representation"

export type PracticeEntryContextSelection =
  | { readonly kind: "meaning" }
  | { readonly kind: "original" }
  | { readonly kind: "representation"; readonly representationTypeId: number }

export const defaultPracticeEntryContextSelection: PracticeEntryContextSelection = { kind: "meaning" }

export function serializePracticeEntryContextSelection(selection: PracticeEntryContextSelection): string {
  return JSON.stringify(selection)
}

export function parsePracticeEntryContextSelection(raw: string | null): PracticeEntryContextSelection | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object") return null
    const kind = (parsed as { kind?: string }).kind
    if (kind === "meaning" || kind === "original") return { kind }
    if (kind === "representation") {
      const representationTypeId = (parsed as { representationTypeId?: unknown }).representationTypeId
      if (typeof representationTypeId === "number" && Number.isFinite(representationTypeId)) {
        return { kind: "representation", representationTypeId }
      }
    }
    return null
  } catch {
    return null
  }
}

type EntryContextCard = {
  readonly value: string
  readonly meaning?: string | null
  readonly representations?: readonly CaseRepresentationDto[]
}

export function listPracticeEntryContextOptions(
  _card: EntryContextCard,
  representationTypes: readonly RepresentationTypeDto[],
): readonly PracticeEntryContextSelection[] {
  return [
    { kind: "meaning" },
    { kind: "original" },
    ...representationTypes.map(
      (type): PracticeEntryContextSelection => ({
        kind: "representation",
        representationTypeId: type.id,
      }),
    ),
  ]
}

export function practiceEntryContextSelectionKey(selection: PracticeEntryContextSelection): string {
  if (selection.kind === "representation") return `rep-${selection.representationTypeId}`
  return selection.kind
}

export function practiceEntryContextSelectionLabel(
  selection: PracticeEntryContextSelection,
  representationTypes: readonly RepresentationTypeDto[],
): string {
  if (selection.kind === "meaning") return caseEntryMeaningFieldLabel
  if (selection.kind === "original") return caseEntryValueFieldLabel
  const type = representationTypes.find((item) => item.id === selection.representationTypeId)
  return type ? formatRepresentationTypeLabel(type.name) : "Representation"
}

export function coercePracticeEntryContextSelection(
  selection: PracticeEntryContextSelection,
  card: EntryContextCard,
  representationTypes: readonly RepresentationTypeDto[],
): PracticeEntryContextSelection {
  const options = listPracticeEntryContextOptions(card, representationTypes)
  const keys = new Set(options.map(practiceEntryContextSelectionKey))
  if (keys.has(practiceEntryContextSelectionKey(selection))) return selection
  return options[0] ?? defaultPracticeEntryContextSelection
}

export function resolvePracticeEntryContextText(
  selection: PracticeEntryContextSelection,
  card: EntryContextCard,
): string | null {
  if (selection.kind === "meaning") {
    const trimmed = card.meaning?.trim() ?? ""
    return trimmed.length > 0 ? trimmed : null
  }
  if (selection.kind === "original") {
    const trimmed = card.value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  const rep = nonEmptyCaseRepresentations(card.representations).find(
    (item) => item.representationTypeId === selection.representationTypeId,
  )
  if (rep) return rep.value

  return null
}

export function practiceEntryContextEmptyHint(
  selection: PracticeEntryContextSelection,
  representationTypes: readonly RepresentationTypeDto[],
): string {
  if (selection.kind === "meaning") return `No ${caseEntryMeaningFieldLabel.toLowerCase()} on this card yet.`
  if (selection.kind === "original") return `No ${caseEntryValueFieldLabel.toLowerCase()} on this card yet.`
  const type = representationTypes.find((item) => item.id === selection.representationTypeId)
  const label = type ? formatRepresentationTypeLabel(type.name) : "representation"
  return `No ${label.toLowerCase()} on this card yet.`
}