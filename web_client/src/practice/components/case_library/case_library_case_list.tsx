import { CaseLibraryTile } from "@/practice/components/case_library/case_library_tile"
import { filterCasesBySearch } from "@/practice/components/case_library/case_library_search"
import { TextField } from "@/core/components/atoms/text_field"
import type { PracticeCardDto } from "@/practice/practice_repository"
import { useMemo, useState } from "react"

type CaseLibraryCaseListProps = {
  readonly cards: readonly PracticeCardDto[]
  readonly selectedId: string | null
  readonly onSelect: (caseId: string) => void
}

export function CaseLibraryCaseList({ cards, selectedId, onSelect }: CaseLibraryCaseListProps) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => filterCasesBySearch(cards, query), [cards, query])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <TextField
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search entries…"
        aria-label="Search vocabulary entries"
        autoComplete="off"
        className="sticky top-0 z-10 bg-background"
      />
      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          {cards.length === 0 ? null : "No entries match your search."}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {filtered.map((card) => (
            <li key={card.id}>
              <CaseLibraryTile card={card} selected={card.id === selectedId} onSelect={() => onSelect(card.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}