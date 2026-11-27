"use client"

import { NoteCardLayout } from "@/practice/components/notes/note_card_layout"
import type { NoteDto } from "@/practice/practice_repository"

type NotesTileProps = {
  readonly note: NoteDto
  readonly selected: boolean
  readonly onSelect: () => void
}

export function NotesTile({ note, selected, onSelect }: NotesTileProps) {
  return (
    <button type="button" onClick={onSelect} className="w-full text-left">
      <NoteCardLayout
        name={note.name}
        content={note.content}
        selected={selected}
        className={selected ? undefined : "hover:border-accent/30"}
        footer={
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted">
            {note.caseCount === 1 ? "1 entry" : `${note.caseCount} entries`}
          </p>
        }
      />
    </button>
  )
}