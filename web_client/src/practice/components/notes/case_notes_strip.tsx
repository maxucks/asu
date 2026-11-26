"use client"

import { noteContentPreview } from "@/practice/practice_note_utils"
import { IconPlus } from "@/practice/components/session/icon_button"
import type { CaseNoteRefDto } from "@/practice/practice_repository"

type CaseNotesStripProps = {
  readonly notes: readonly CaseNoteRefDto[]
  readonly onOpenNote: (noteId: string) => void
  readonly onAddNote: () => void
}

export function CaseNotesStrip({ notes, onOpenNote, onAddNote }: CaseNotesStripProps) {
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between gap-2 px-0.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Notes</p>
        <button
          type="button"
          onClick={onAddNote}
          className="inline-flex items-center gap-1 rounded-lg border border-grid-line bg-card px-2 py-1 text-xs font-medium text-foreground hover:border-accent/40"
        >
          <IconPlus />
          Add note
        </button>
      </div>
      <div className="scrollbar-hidden flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
        {notes.map((note) => {
          const preview = noteContentPreview(note.content)
          return (
            <button
              key={note.id}
              type="button"
              onClick={() => onOpenNote(note.id)}
              className="flex w-[min(85vw,16rem)] shrink-0 snap-start flex-col gap-1 rounded-xl border border-grid-line bg-card px-3 py-2.5 text-left transition hover:border-accent/40"
            >
              <p className="truncate text-sm font-semibold text-foreground">{note.name}</p>
              <p className="line-clamp-3 whitespace-pre-wrap text-xs leading-snug text-muted">{preview}</p>
            </button>
          )
        })}
        {notes.length === 0 ? (
          <button
            type="button"
            onClick={onAddNote}
            className="flex w-[min(85vw,14rem)] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-grid-line bg-tile/50 px-3 py-6 text-center text-xs text-muted hover:border-accent/40"
          >
            <IconPlus />
            Attach or create a note
          </button>
        ) : null}
      </div>
    </div>
  )
}