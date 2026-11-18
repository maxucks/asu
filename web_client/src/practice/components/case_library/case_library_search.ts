import type { PracticeCardDto } from "@/practice/practice_repository"

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase()
}

export function filterCasesBySearch(cards: readonly PracticeCardDto[], query: string): readonly PracticeCardDto[] {
  const needle = normalizeQuery(query)
  if (needle.length === 0) return cards

  return cards.filter((card) => {
    if (card.lemmaText.toLowerCase().includes(needle)) return true
    if ((card.meaning ?? "").toLowerCase().includes(needle)) return true
    return card.categories.some((category) => category.name.toLowerCase().includes(needle))
  })
}