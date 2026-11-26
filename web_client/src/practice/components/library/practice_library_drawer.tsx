"use client"

import { LibraryTabBar, type LibraryTab } from "@/practice/components/library/library_tab_bar"
import { useCaseLibraryPanel } from "@/practice/components/library/case_library_panel"
import { useNotesLibraryPanel } from "@/practice/components/library/notes_library_panel"
import { IconButton, IconClose } from "@/practice/components/session/icon_button"
import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import type { PracticeRepository } from "@/practice/practice_repository"
import { useEffect } from "react"

export type OpenPracticeLibraryOptions = {
  readonly tab?: LibraryTab
  readonly noteId?: string | null
  readonly linkCaseId?: string | null
}

type PracticeLibraryDrawerProps = {
  readonly open: boolean
  readonly languageId: string
  readonly languageName?: string
  readonly languageIcon?: string
  readonly repo: PracticeRepository
  readonly representationTypes: readonly RepresentationTypeDto[]
  readonly onClose: () => void
  readonly onVocabularyChange?: () => void
  readonly tab: LibraryTab
  readonly onTab: (tab: LibraryTab) => void
  readonly initialNoteId?: string | null
  readonly linkCaseId?: string | null
  readonly attachedNoteIds?: readonly string[]
}

export function PracticeLibraryDrawer({
  open,
  languageId,
  languageName,
  languageIcon,
  repo,
  representationTypes,
  onClose,
  onVocabularyChange,
  tab,
  onTab,
  initialNoteId,
  linkCaseId,
  attachedNoteIds,
}: PracticeLibraryDrawerProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, open])

  const casesPanel = useCaseLibraryPanel({
    active: open && tab === "cases",
    languageId,
    repo,
    representationTypes,
    onVocabularyChange,
  })

  const notesPanel = useNotesLibraryPanel({
    active: open && tab === "notes",
    languageId,
    repo,
    initialNoteId: open ? initialNoteId : null,
    linkCaseId: open ? linkCaseId : null,
    attachedNoteIds,
    onNotesChange: onVocabularyChange,
  })

  if (!open) return null

  const addControl = tab === "cases" ? casesPanel.addControl : notesPanel.addControl

  return (
    <div className="fixed inset-0 z-[55] flex justify-end" role="presentation">
      <button
        type="button"
        aria-label="Close library"
        className="min-w-[max(1.25rem,5vw)] flex-1 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Words and notes library"
        className="flex h-dvh w-[min(94vw,72rem)] max-w-[94vw] shrink-0 flex-col overflow-hidden rounded-l-2xl border border-grid-line bg-background"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 flex-col gap-3 border-b border-grid-line px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-2xl leading-none" aria-hidden title={languageName}>
              {languageIcon ?? "🌐"}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold text-foreground">{languageName ?? "Library"}</h2>
              <p className="text-xs text-muted">Words and notes for this language</p>
            </div>
            <div className="hidden shrink-0 sm:block">{addControl}</div>
            <IconButton label="Close library" onClick={onClose}>
              <IconClose />
            </IconButton>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LibraryTabBar
              tab={tab}
              onTab={onTab}
              casesCount={casesPanel.cardsCount}
              notesCount={notesPanel.notesCount}
            />
            <div className="flex-1 sm:hidden">{addControl}</div>
          </div>
        </header>

        {tab === "cases" ? casesPanel.body : notesPanel.body}
      </div>
    </div>
  )
}