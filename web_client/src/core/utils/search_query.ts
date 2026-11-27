/** Normalized query for case-insensitive substring search (trim + lower case). */
export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase()
}

export function filterBySubstringSearch<T>(
  items: readonly T[],
  query: string,
  getSearchableTexts: (item: T) => readonly string[],
): readonly T[] {
  const normalized = normalizeSearchQuery(query)
  if (normalized.length === 0) return items
  return items.filter((item) =>
    getSearchableTexts(item).some((text) => text.toLowerCase().includes(normalized)),
  )
}

/** Exact match on display name after normalization; empty query yields no match. */
export function findByExactSearchName<T>(
  items: readonly T[],
  query: string,
  getName: (item: T) => string,
): T | undefined {
  const normalized = normalizeSearchQuery(query)
  if (normalized.length === 0) return undefined
  return items.find((item) => getName(item).toLowerCase() === normalized)
}

/** True when query is non-empty and no existing item shares the same name (case-insensitive). */
export function canCreateNewFromSearchQuery(query: string, existingNames: readonly string[]): boolean {
  const trimmed = query.trim()
  if (trimmed.length === 0) return false
  const normalized = trimmed.toLowerCase()
  return !existingNames.some((name) => name.toLowerCase() === normalized)
}