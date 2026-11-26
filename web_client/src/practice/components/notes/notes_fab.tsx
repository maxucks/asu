"use client"

import type { LibraryTab } from "@/practice/components/library/library_tab_bar"

type LibraryFabProps = {
  readonly onOpen: (tab?: LibraryTab) => void
}

export function LibraryFab({ onOpen }: LibraryFabProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen()}
      aria-label="Open library"
      className="fixed bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-full border border-grid-line bg-card px-4 text-sm font-semibold text-foreground shadow-lg transition hover:border-accent/50 hover:bg-accent-soft/40"
    >
      <span className="text-lg leading-none" aria-hidden>
        📚
      </span>
      Library
    </button>
  )
}

/** @deprecated Use LibraryFab */
export const NotesFab = LibraryFab