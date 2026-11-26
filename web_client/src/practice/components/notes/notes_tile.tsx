"use client"

import { noteContentPreview } from "@/practice/practice_note_utils"
import type { NoteDto } from "@/practice/practice_repository"

type NotesTileProps = {
  readonly note: NoteDto
  readonly selected: boolean
  readonly onSelect: () => void
}

export function NotesTile({ note, selected, onSelect }: NotesTileProps) {
  const preview = noteContentPreview(note.content)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition ${selected ? "border-accent bg-accent-soft/40 ring-1 ring-accent/30" : "border-grid-line bg-card hover:border-accent/30"}`}
    >
      <p className="truncate text-sm font-semibold text-foreground">{note.name}</p>
      <p className="line-clamp-3 whitespace-pre-wrap text-xs leading-snug text-muted">{preview}</p>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted">
        {note.caseCount === 1 ? "1 entry" : `${note.caseCount} entries`}
      </p>
    </button>
  )
}