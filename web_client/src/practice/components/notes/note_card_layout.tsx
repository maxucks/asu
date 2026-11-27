"use client"

import { noteContentPreview } from "@/practice/practice_note_utils"
import type { ReactNode } from "react"

type NoteCardLayoutProps = {
  readonly name: string
  readonly content: string
  readonly selected?: boolean
  readonly footer?: ReactNode
  readonly className?: string
}

export function NoteCardLayout({ name, content, selected, footer, className }: NoteCardLayoutProps) {
  const preview = noteContentPreview(content)
  const surface = selected
    ? "border-accent bg-accent-soft/40 ring-1 ring-accent/30"
    : "border-grid-line bg-card"

  return (
    <div
      className={`flex w-full min-w-0 flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition ${surface} ${className ?? ""}`}
    >
      <p className="truncate text-sm font-semibold text-foreground">{name}</p>
      <p className="line-clamp-3 whitespace-pre-wrap text-xs leading-snug text-muted">{preview}</p>
      {footer}
    </div>
  )
}