"use client"

import { CategorySuggestionList } from "@/practice/components/category/category_suggestion_list"
import { NoteAddStepperControl } from "@/practice/components/notes/note_add_stepper_control"
import { noteContentPreview } from "@/practice/practice_note_utils"
import type { CaseNoteRefDto, NoteDto } from "@/practice/practice_repository"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type CaseNoteAttachFieldProps = {
  readonly notes: readonly CaseNoteRefDto[]
  readonly languageNotes: readonly NoteDto[]
  readonly disabled?: boolean
  readonly attaching?: boolean
  readonly onOpenNote: (noteId: string) => void
  readonly onAttach: (noteId: string) => Promise<boolean>
  readonly onCreateAndAttach: (name: string, content: string) => Promise<boolean>
}

export function CaseNoteAttachField({
  notes,
  languageNotes,
  disabled,
  attaching,
  onOpenNote,
  onAttach,
  onCreateAndAttach,
}: CaseNoteAttachFieldProps) {
  const [editing, setEditing] = useState(false)
  const [createMode, setCreateMode] = useState(false)
  const [createTitle, setCreateTitle] = useState("")
  const [createOpenContentStep, setCreateOpenContentStep] = useState(false)
  const [query, setQuery] = useState("")
  const [listOpen, setListOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pickerAnchorRef = useRef<HTMLDivElement>(null)

  const attachedIds = useMemo(() => new Set(notes.map((note) => note.id)), [notes])

  const pickable = useMemo(
    () => languageNotes.filter((note) => !attachedIds.has(note.id)),
    [attachedIds, languageNotes],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length === 0) return pickable
    return pickable.filter(
      (note) => note.name.toLowerCase().includes(q) || note.content.toLowerCase().includes(q),
    )
  }, [pickable, query])

  const queryTrim = query.trim()
  const canCreateFromQuery =
    queryTrim.length > 0 &&
    !languageNotes.some((note) => note.name.toLowerCase() === queryTrim.toLowerCase())

  const closePicker = useCallback(() => {
    setListOpen(false)
    setEditing(false)
    setCreateMode(false)
    setCreateTitle("")
    setCreateOpenContentStep(false)
    setQuery("")
  }, [])

  function startSearch() {
    if (disabled || createMode) return
    setEditing(true)
    setListOpen(true)
  }

  function startCreateFromQuery(options?: { readonly openContentStep?: boolean }) {
    if (!canCreateFromQuery || disabled) return
    setCreateMode(true)
    setCreateTitle(queryTrim)
    setCreateOpenContentStep(options?.openContentStep === true)
    setListOpen(false)
    setEditing(false)
    setQuery("")
  }

  useEffect(() => {
    if (!editing) return
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [editing])

  useEffect(() => {
    if (!editing && !createMode) return
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      if (target instanceof Element && target.closest("[data-category-suggestions]")) return
      if (target instanceof Element && target.closest("[data-note-add-panel]")) return
      if (createMode) return
      closePicker()
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [closePicker, createMode, editing])

  return (
    <div ref={rootRef} className="w-full">
      <div className="mb-1.5 flex items-center justify-between gap-2 px-0.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Notes</p>
        {!createMode ? (
          <div
            ref={pickerAnchorRef}
            className={`relative flex h-8 shrink-0 items-center rounded-lg border border-grid-line transition-[width,background-color] duration-200 ease-out ${
              editing ? "w-48 bg-tile px-2 shadow-sm overflow-visible" : "w-36 overflow-hidden bg-transparent px-2 hover:bg-tile"
            }`}
          >
            {!editing ? (
              <button
                type="button"
                disabled={disabled || attaching}
                onClick={startSearch}
                className="flex h-8 w-full items-center text-xs font-medium text-muted hover:text-foreground disabled:opacity-40"
              >
                Find or add note…
              </button>
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={query}
                disabled={disabled || attaching}
                placeholder="Search notes…"
                onFocus={() => setListOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setListOpen(true)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") closePicker()
                  if (e.key === "Backspace" && query.length === 0) {
                    e.preventDefault()
                    closePicker()
                    return
                  }
                  if (e.key === "Enter") {
                    e.preventDefault()
                    const q = query.trim().toLowerCase()
                    const exact = pickable.find((note) => note.name.toLowerCase() === q)
                    if (exact) void onAttach(exact.id).then((ok) => ok && closePicker())
                    else if (canCreateFromQuery) startCreateFromQuery({ openContentStep: true })
                    else if (filtered[0]) void onAttach(filtered[0].id).then((ok) => ok && closePicker())
                  }
                }}
                className="h-8 min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none disabled:opacity-50"
              />
            )}
          </div>
        ) : null}
      </div>

      {createMode ? (
        <NoteAddStepperControl
          key={createTitle}
          className="mb-2 w-full"
          embedded
          saving={attaching}
          initialTitle={createTitle}
          initialContentStep={createOpenContentStep}
          triggerLabel="New note"
          onCreate={onCreateAndAttach}
          onDismiss={() => {
            setCreateMode(false)
            setCreateTitle("")
          }}
        />
      ) : null}

      <CategorySuggestionList
        open={listOpen && editing}
        anchorRef={pickerAnchorRef}
        widthClassName="w-56 max-w-[min(16rem,calc(100vw-1rem))]"
      >
        {filtered.length === 0 && !canCreateFromQuery && query.trim() ? (
          <li className="px-3 py-2 text-sm text-muted">No matching notes.</li>
        ) : null}
        {filtered.length === 0 && !query.trim() ? (
          <li className="px-3 py-2 text-sm text-muted">
            {pickable.length === 0 ? "No notes to attach yet." : "Type to search notes."}
          </li>
        ) : null}
        {filtered.map((note) => (
          <li key={note.id}>
            <button
              type="button"
              disabled={disabled || attaching}
              className="flex w-full flex-col gap-0.5 px-3 py-2 text-left transition hover:bg-tile disabled:opacity-40"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => void onAttach(note.id).then((ok) => ok && closePicker())}
            >
              <span className="truncate text-sm font-medium text-foreground">{note.name}</span>
              <span className="line-clamp-1 text-xs text-muted">{noteContentPreview(note.content)}</span>
            </button>
          </li>
        ))}
        {canCreateFromQuery ? (
          <li className="border-t border-grid-line">
            <button
              type="button"
              disabled={disabled || attaching}
              className="flex w-full px-3 py-2 text-left text-sm text-accent transition hover:bg-tile disabled:opacity-40"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => startCreateFromQuery()}
            >
              Create note “{queryTrim}”
            </button>
          </li>
        ) : null}
      </CategorySuggestionList>

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
        {notes.length === 0 && !createMode ? (
          <p className="text-xs text-muted px-1 py-2">Search above to attach or create a note.</p>
        ) : null}
      </div>
    </div>
  )
}