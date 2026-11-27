"use client"

import { AttachedNoteCard } from "@/practice/components/notes/attached_note_card"
import type { CaseNoteRefDto } from "@/practice/practice_repository"

type CaseAttachedNotesListProps = {
  readonly notes: readonly CaseNoteRefDto[]
  readonly disabled?: boolean
  readonly detachingNoteId?: string | null
  readonly onOpenNote: (noteId: string) => void
  readonly onDetach: (noteId: string) => void | Promise<void>
  readonly emptyMessage?: string
}

export function CaseAttachedNotesList({
  notes,
  disabled,
  detachingNoteId,
  onOpenNote,
  onDetach,
  emptyMessage = "No notes attached yet.",
}: CaseAttachedNotesListProps) {
  if (notes.length === 0) {
    return <p className="text-xs text-muted px-0.5 py-2">{emptyMessage}</p>
  }

  return (
    <ul className="flex w-full flex-col gap-2">
      {notes.map((note) => (
        <li key={note.id}>
          <AttachedNoteCard
            note={note}
            disabled={disabled}
            busy={detachingNoteId === note.id}
            onOpen={() => onOpenNote(note.id)}
            onDetach={() => onDetach(note.id)}
          />
        </li>
      ))}
    </ul>
  )
}