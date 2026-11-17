import type { PracticeCardDto } from "@/practice/practice_repository"
import type { AssociationDto } from "@/core/data_sources/http_case_data_source"

export function previewAssociationPair(
  card: PracticeCardDto,
): readonly [AssociationDto | null, AssociationDto | null] {
  const sorted = [...card.associations].sort((left, right) => left.sortOrder - right.sortOrder)
  return [sorted[0] ?? null, sorted[1] ?? null]
}