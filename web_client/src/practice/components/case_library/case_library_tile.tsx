"use client"

import { CategoryChipRow } from "@/practice/components/category/category_chip_row"
import { CaseLibraryAssocPreview } from "@/practice/components/case_library/case_library_assoc_preview"
import { previewAssociationPair } from "@/practice/components/case_library/case_library_utils"
import { caseAttachedNotesCountLabel } from "@/practice/practice_note_utils"
import type { PracticeCardDto } from "@/practice/practice_repository"

type CaseLibraryTileProps = {
  readonly card: PracticeCardDto
  readonly selected: boolean
  readonly onSelect: () => void
}

export function CaseLibraryTile({ card, selected, onSelect }: CaseLibraryTileProps) {
  const [left, right] = previewAssociationPair(card)
  const attachedNotesCount = card.notes?.length ?? 0

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex aspect-[4/5] w-full flex-col overflow-hidden rounded-2xl border text-left transition ${selected ? "border-accent ring-1 ring-accent/40" : "border-grid-line hover:border-accent/30"}`}
    >
      <div className="flex h-[60%] min-h-0 flex-col justify-center gap-1 bg-card px-3 py-2">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted/80 tabular-nums">
          {caseAttachedNotesCountLabel(attachedNotesCount)}
        </p>
        <p className="truncate text-sm font-semibold text-foreground">{card.value}</p>
        <p className="line-clamp-2 text-xs leading-snug text-muted">{card.meaning?.trim() || "No description"}</p>
        {card.categories.length > 0 ? (
          <div className="mt-0.5 w-full min-w-0">
            <CategoryChipRow
              items={card.categories}
              size="compact"
              expandable={false}
              overflowMode="count-chip"
            />
          </div>
        ) : null}
      </div>
      <div className="grid h-[40%] min-h-0 grid-cols-2 gap-0 border-t border-grid-line">
        <CaseLibraryAssocPreview association={left} />
        <CaseLibraryAssocPreview association={right} />
      </div>
    </button>
  )
}