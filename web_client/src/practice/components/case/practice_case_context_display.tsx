"use client"

import type { CaseRepresentationDto } from "@/core/data_sources/http_case_data_source"
import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import { IconButton, IconSwapTarget } from "@/practice/components/session/icon_button"
import {
  listPracticeEntryContextOptions,
  practiceEntryContextEmptyHint,
  practiceEntryContextSelectionKey,
  practiceEntryContextSelectionLabel,
  resolvePracticeEntryContextText,
  type PracticeEntryContextSelection,
} from "@/practice/practice_entry_context"
import { useEffect, useRef, useState } from "react"

type PracticeCaseContextDisplayProps = {
  readonly value: string
  readonly meaning?: string | null
  readonly representations?: readonly CaseRepresentationDto[]
  readonly representationTypes: readonly RepresentationTypeDto[]
  readonly selection: PracticeEntryContextSelection
  readonly onSelection: (selection: PracticeEntryContextSelection) => void
}

export function PracticeCaseContextDisplay({
  value,
  meaning,
  representations,
  representationTypes,
  selection,
  onSelection,
}: PracticeCaseContextDisplayProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const card = { value, meaning, representations }
  const options = listPracticeEntryContextOptions(card, representationTypes)
  const body = resolvePracticeEntryContextText(selection, card)
  const currentLabel = practiceEntryContextSelectionLabel(selection, representationTypes)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    window.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  if (options.length === 0) return null

  return (
    <div ref={rootRef} className="relative rounded-xl border border-grid-line bg-tile px-4 py-3 pr-11">
      <p className="text-sm leading-relaxed text-foreground/90">
        {body ?? (
          <span className="text-muted">{practiceEntryContextEmptyHint(selection, representationTypes)}</span>
        )}
      </p>

      <IconButton
        label={`Switch entry context (showing ${currentLabel})`}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="!absolute right-1.5 top-1.5 !size-7 rounded-md"
        onClick={() => setOpen((value) => !value)}
      >
        <IconSwapTarget />
      </IconButton>

      {open ? (
        <ul
          role="listbox"
          aria-label="Entry context"
          className="absolute right-1.5 top-9 z-30 max-h-dropdown w-52 overflow-y-auto rounded-lg border border-grid-line bg-card py-1 shadow-xl"
        >
          {options.map((option) => {
            const active = practiceEntryContextSelectionKey(option) === practiceEntryContextSelectionKey(selection)
            return (
              <li key={practiceEntryContextSelectionKey(option)} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`flex w-full px-3 py-2 text-left text-sm transition hover:bg-tile ${
                    active ? "text-accent" : "text-foreground"
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onSelection(option)
                    setOpen(false)
                  }}
                >
                  {practiceEntryContextSelectionLabel(option, representationTypes)}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}