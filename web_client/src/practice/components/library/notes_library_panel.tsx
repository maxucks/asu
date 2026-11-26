"use client"

import { LibraryEmptyHint } from "@/practice/components/library/library_empty_hint"
import { NotesAddControl } from "@/practice/components/notes/notes_add_control"
import { NotesDetail } from "@/practice/components/notes/notes_detail"
import { NotesTile } from "@/practice/components/notes/notes_tile"
import type { NoteDto, PracticeRepository } from "@/practice/practice_repository"
import { useCallback, useEffect, useMemo, useState } from "react"

function resolveSelectedNoteId(notes: readonly NoteDto[], preferId?: string | null): string | null {
  if (notes.length === 0) return null
  if (preferId && notes.some((note) => note.id === preferId)) return preferId
  return notes[0]?.id ?? null
}

type UseNotesLibraryPanelOptions = {
  readonly active: boolean
  readonly languageId: string
  readonly repo: PracticeRepository
  readonly initialNoteId?: string | null
  readonly linkCaseId?: string | null
  readonly attachedNoteIds?: readonly string[]
  readonly onNotesChange?: () => void
}

export function useNotesLibraryPanel({
  active,
  languageId,
  repo,
  initialNoteId,
  linkCaseId,
  attachedNoteIds,
  onNotesChange,
}: UseNotesLibraryPanelOptions) {
  const [notes, setNotes] = useState<readonly NoteDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [createBusy, setCreateBusy] = useState(false)

  const attachedSet = useMemo(() => new Set(attachedNoteIds ?? []), [attachedNoteIds])

  const loadNotes = useCallback(
    async (preferId?: string | null) => {
      setLoading(true)
      setError(null)
      const result = await repo.listNotes(languageId)
      setLoading(false)
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      setNotes(result.value)
      setSelectedId(resolveSelectedNoteId(result.value, preferId ?? initialNoteId))
    },
    [initialNoteId, languageId, repo],
  )

  useEffect(() => {
    if (!active) return
    void loadNotes(initialNoteId)
  }, [active, initialNoteId, loadNotes])

  useEffect(() => {
    if (!active || !initialNoteId) return
    setSelectedId(initialNoteId)
  }, [active, initialNoteId])

  const selected = selectedId ? (notes.find((note) => note.id === selectedId) ?? null) : null
  const splitView = notes.length > 0

  async function handleCreate(name: string, content: string): Promise<boolean> {
    setCreateBusy(true)
    const result = await repo.createNote(languageId, name, content)
    if (!result.ok) {
      setCreateBusy(false)
      setError(result.error.message)
      return false
    }

    if (linkCaseId) {
      const linkResult = await repo.linkCaseNote(linkCaseId, { noteId: result.value.id })
      setCreateBusy(false)
      if (!linkResult.ok) {
        setError(linkResult.error.message)
        await loadNotes(result.value.id)
        onNotesChange?.()
        return false
      }
      onNotesChange?.()
    } else {
      setCreateBusy(false)
    }

    await loadNotes(result.value.id)
    onNotesChange?.()
    return true
  }

  function handleNoteChange(next: NoteDto) {
    setNotes((current) => current.map((entry) => (entry.id === next.id ? next : entry)))
    onNotesChange?.()
  }

  function handleDeleted() {
    const remaining = notes.filter((note) => note.id !== selectedId)
    setNotes(remaining)
    setSelectedId(resolveSelectedNoteId(remaining, null))
    onNotesChange?.()
  }

  const addControl = <NotesAddControl saving={createBusy} onCreate={handleCreate} />

  return {
    notesCount: notes.length,
    splitView,
    addControl,
    body: (
      <NotesLibraryPanelBody
        loading={loading}
        error={error}
        notes={notes}
        selectedId={selectedId}
        selected={selected}
        createBusy={createBusy}
        splitView={splitView}
        linkCaseId={linkCaseId}
        attachedSet={attachedSet}
        repo={repo}
        onSelectNote={setSelectedId}
        onCreate={handleCreate}
        onNoteChange={handleNoteChange}
        onDeleted={handleDeleted}
        onAttached={() => {
          onNotesChange?.()
          if (selected) void loadNotes(selected.id)
        }}
      />
    ),
  }
}

type NotesLibraryPanelBodyProps = {
  readonly loading: boolean
  readonly error: string | null
  readonly notes: readonly NoteDto[]
  readonly selectedId: string | null
  readonly selected: NoteDto | null
  readonly createBusy: boolean
  readonly splitView: boolean
  readonly linkCaseId?: string | null
  readonly attachedSet: Set<string>
  readonly repo: PracticeRepository
  readonly onSelectNote: (id: string) => void
  readonly onCreate: (name: string, content: string) => Promise<boolean>
  readonly onNoteChange: (note: NoteDto) => void
  readonly onDeleted: () => void
  readonly onAttached: () => void
}

function NotesLibraryPanelBody(props: NotesLibraryPanelBodyProps) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <section
        className={`flex min-h-0 flex-col ${props.splitView ? "w-2/5 min-w-0 max-w-md border-r border-grid-line" : "w-full"}`}
      >
        <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {props.loading ? <p className="text-sm text-muted">Loading…</p> : null}
          {props.error ? <p className="text-sm text-danger">{props.error}</p> : null}
          {!props.loading && props.notes.length === 0 ? (
            <LibraryEmptyHint
              message="No notes in this language yet."
              hint="Use Add note in the header to create one."
            />
          ) : null}
          {props.notes.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {props.notes.map((note) => (
                <li key={note.id}>
                  <NotesTile
                    note={note}
                    selected={note.id === props.selectedId}
                    onSelect={() => props.onSelectNote(note.id)}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {props.selected ? (
        <NotesDetail
          key={props.selected.id}
          note={props.selected}
          repo={props.repo}
          linkCaseId={props.linkCaseId}
          attachedToCase={props.attachedSet.has(props.selected.id)}
          onNoteChange={props.onNoteChange}
          onDeleted={props.onDeleted}
          onAttached={props.onAttached}
        />
      ) : null}
    </div>
  )
}
