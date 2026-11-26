"use client"

import { ConfirmBox } from "@/practice/components/session/confirm_box"
import { IconButton, IconTrash } from "@/practice/components/session/icon_button"
import { PrimaryActionButton } from "@/practice/components/session/primary_action_button"
import type { NoteDto, PracticeRepository } from "@/practice/practice_repository"
import { useCallback, useEffect, useRef, useState } from "react"

type NotesDetailProps = {
  readonly note: NoteDto
  readonly repo: PracticeRepository
  readonly linkCaseId?: string | null
  readonly attachedToCase: boolean
  readonly onNoteChange: (note: NoteDto) => void
  readonly onDeleted: () => void
  readonly onAttached?: () => void
}

export function NotesDetail({
  note,
  repo,
  linkCaseId,
  attachedToCase,
  onNoteChange,
  onDeleted,
  onAttached,
}: NotesDetailProps) {
  const [nameDraft, setNameDraft] = useState(note.name)
  const [contentDraft, setContentDraft] = useState(note.content)
  const [saving, setSaving] = useState(false)
  const [attachBusy, setAttachBusy] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const saveTimerRef = useRef<number | null>(null)
  const saveInFlightRef = useRef(false)
  const loadedNoteIdRef = useRef(note.id)

  useEffect(() => {
    if (note.id === loadedNoteIdRef.current) return
    loadedNoteIdRef.current = note.id
    setNameDraft(note.name)
    setContentDraft(note.content)
    setError(null)
  }, [note.id, note.name, note.content])

  const save = useCallback(async () => {
    const nextName = nameDraft.trim()
    if (nextName.length === 0) return
    if (nextName === note.name && contentDraft === note.content) return
    if (saveInFlightRef.current) return

    saveInFlightRef.current = true
    setSaving(true)
    setError(null)
    const result = await repo.updateNote(note.id, {
      name: nextName,
      content: contentDraft,
    })
    saveInFlightRef.current = false
    setSaving(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    onNoteChange(result.value)
  }, [contentDraft, nameDraft, note.content, note.id, note.name, onNoteChange, repo])

  const flushPendingSave = useCallback(() => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    void save()
  }, [save])

  useEffect(() => {
    const nextName = nameDraft.trim()
    const unchanged = nextName === note.name && contentDraft === note.content
    if (unchanged || nextName.length === 0) return

    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null
      void save()
    }, 800)

    return () => {
      if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current)
    }
  }, [contentDraft, nameDraft, note.content, note.name, save])

  const attach = useCallback(async () => {
    if (!linkCaseId || attachedToCase) return
    setAttachBusy(true)
    setError(null)
    const result = await repo.linkCaseNote(linkCaseId, { noteId: note.id })
    setAttachBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    onAttached?.()
  }, [attachedToCase, linkCaseId, note.id, onAttached, repo])

  const confirmDelete = useCallback(async () => {
    setDeleteBusy(true)
    const result = await repo.deleteNote(note.id)
    setDeleteBusy(false)
    setPendingDelete(false)
    if (!result.ok) {
      setError(result.error.message)
      return
    }
    onDeleted()
  }, [note.id, onDeleted, repo])

  const deleteMessage =
    note.caseCount > 0
      ? `This note is attached to ${note.caseCount} ${note.caseCount === 1 ? "entry" : "entries"}. Remove it from all of them? This cannot be undone.`
      : "Delete this note permanently? This cannot be undone."

  const titleClassName =
    "w-full border-0 bg-transparent text-2xl font-semibold tracking-tight text-foreground placeholder:text-muted/70 focus:outline-none"
  const bodyClassName =
    "mt-4 min-h-[min(50vh,24rem)] w-full flex-1 resize-none border-0 bg-transparent text-base leading-relaxed text-foreground placeholder:text-muted/70 focus:outline-none"

  return (
    <aside className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
      <p className="sr-only">Note editor</p>
      <div className="flex shrink-0 items-center justify-between gap-2 px-6 pb-2 pt-5">
        <p className="text-xs text-muted">
          {saving ? "Saving…" : `Linked to ${note.caseCount} ${note.caseCount === 1 ? "entry" : "entries"}`}
        </p>
        <IconButton label="Delete note" tone="danger" onClick={() => setPendingDelete(true)}>
          <IconTrash />
        </IconButton>
      </div>

      {error ? <p className="px-6 pb-2 text-sm text-danger">{error}</p> : null}

      <div className="scrollbar-hidden flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6">
        <input
          type="text"
          value={nameDraft}
          placeholder="Untitled"
          aria-label="Note title"
          onChange={(event) => setNameDraft(event.target.value)}
          onBlur={flushPendingSave}
          className={titleClassName}
        />
        <textarea
          value={contentDraft}
          placeholder="Start writing…"
          aria-label="Note content"
          onChange={(event) => setContentDraft(event.target.value)}
          onBlur={flushPendingSave}
          className={bodyClassName}
        />
      </div>

      {linkCaseId && !attachedToCase ? (
        <div className="shrink-0 border-t border-grid-line/60 px-6 py-3">
          <PrimaryActionButton type="button" disabled={attachBusy} onClick={() => void attach()}>
            Attach to this card
          </PrimaryActionButton>
        </div>
      ) : null}

      <ConfirmBox
        open={pendingDelete}
        title="Delete note?"
        message={deleteMessage}
        confirmLabel="Delete"
        busy={deleteBusy}
        onCancel={() => setPendingDelete(false)}
        onConfirm={() => void confirmDelete()}
      />
    </aside>
  )
}