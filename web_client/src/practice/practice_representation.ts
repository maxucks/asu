import type {
  CaseRepresentationDto,
  CaseRepresentationWrite,
} from "@/core/data_sources/http_case_data_source"
import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"

export type { CaseRepresentationWrite } from "@/core/data_sources/http_case_data_source"

export function emptyRepresentationDrafts(types: readonly RepresentationTypeDto[]): Record<number, string> {
  const drafts: Record<number, string> = {}
  for (const type of types) {
    drafts[type.id] = ""
  }
  return drafts
}

export function representationDraftsFromCard(
  types: readonly RepresentationTypeDto[],
  representations: readonly CaseRepresentationDto[],
): Record<number, string> {
  const byType = new Map(representations.map((item) => [item.representationTypeId, item.value]))
  const drafts = emptyRepresentationDrafts(types)
  for (const type of types) {
    const value = byType.get(type.id)
    if (value) drafts[type.id] = value
  }
  return drafts
}

export function representationWritesFromDrafts(
  types: readonly RepresentationTypeDto[],
  drafts: Record<number, string>,
): readonly CaseRepresentationWrite[] {
  return types.map((type) => {
    const trimmed = (drafts[type.id] ?? "").trim()
    return { representationTypeId: type.id, value: trimmed.length > 0 ? trimmed : null }
  })
}

export function formatRepresentationTypeLabel(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export function nonEmptyCaseRepresentations(
  representations: readonly CaseRepresentationDto[] | undefined,
): readonly CaseRepresentationDto[] {
  return (representations ?? []).filter((item) => item.value.trim().length > 0)
}