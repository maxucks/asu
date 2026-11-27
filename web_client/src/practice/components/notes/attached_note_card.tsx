"use client"

import { NoteCardLayout } from "@/practice/components/notes/note_card_layout"
import type { CaseNoteRefDto } from "@/practice/practice_repository"
import { useEffect, useRef, useState } from "react"

type AttachedNoteCardProps = {
  readonly note: CaseNoteRefDto
  readonly disabled?: boolean
  readonly busy?: boolean
  readonly onOpen: () => void
  readonly onDetach: () => void | Promise<void>
}

export function AttachedNoteCard({ note, disabled, busy, onOpen, onDetach }: AttachedNoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("pointerdown", onPointer)
    return () => document.removeEventListener("pointerdown", onPointer)
  }, [menuOpen])

  const inactive = disabled || busy

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        disabled={inactive}
        onClick={onOpen}
        className="w-full text-left transition hover:opacity-90 disabled:opacity-40"
      >
        <NoteCardLayout
          name={note.name}
          content={note.content}
          className="hover:border-accent/40 pr-10"
        />
      </button>
      <div className="absolute right-2 top-2 z-10">
        <button
          type="button"
          disabled={inactive}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="Note options"
          onClick={(event) => {
            event.stopPropagation()
            setMenuOpen((open) => !open)
          }}
          className="rounded-md border border-grid-line bg-card/95 px-2 py-1 text-sm font-semibold leading-none text-foreground shadow-sm backdrop-blur-sm transition hover:border-accent/40 hover:text-accent disabled:opacity-40"
        >
          ⋯
        </button>
        {menuOpen ? (
          <ul
            className="absolute right-0 z-20 mt-1 min-w-42 overflow-hidden rounded-lg border border-grid-line bg-card py-1 shadow-xl"
            role="menu"
          >
            <li role="none">
              <button
                type="button"
                role="menuitem"
                disabled={inactive}
                className="block w-full px-3 py-2 text-left text-sm text-danger hover:bg-tile hover:text-danger disabled:opacity-40"
                onClick={(event) => {
                  event.stopPropagation()
                  setMenuOpen(false)
                  void onDetach()
                }}
              >
                Detach from entry
              </button>
            </li>
          </ul>
        ) : null}
      </div>
    </div>
  )
}