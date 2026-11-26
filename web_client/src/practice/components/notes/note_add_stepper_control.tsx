"use client"

import { AnchoredPopupPanel } from "@/practice/components/category/anchored_popup_panel"
import { IconPlus } from "@/practice/components/session/icon_button"
import { useCallback, useEffect, useRef, useState } from "react"

const NOTE_TITLE_HINT = "Short label you'll recognize on the card."
const NOTE_CONTENT_HINT = "What should you remember? Press Enter to save."

const FIELD_WIDTH_CLASS = "w-64"

type NoteAddStepperControlProps = {
  readonly saving?: boolean
  readonly onCreate: (name: string, content: string) => boolean | Promise<boolean>
  readonly className?: string
  readonly triggerLabel?: string
  /** When true, only the input anchor is shown (caller provides layout). */
  readonly embedded?: boolean
  readonly initialTitle?: string
  /** Open directly on the content step (title already set). */
  readonly initialContentStep?: boolean
  readonly onDismiss?: () => void
}

export function NoteAddStepperControl({
  saving,
  onCreate,
  className,
  triggerLabel = "Add note",
  embedded = false,
  initialTitle = "",
  initialContentStep = false,
  onDismiss,
}: NoteAddStepperControlProps) {
  const titlePrefilled = initialTitle.trim().length > 0
  const [editing, setEditing] = useState(embedded ? true : titlePrefilled)
  const [contentStep, setContentStep] = useState(titlePrefilled && initialContentStep)
  const [name, setName] = useState(initialTitle)
  const [content, setContent] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const nameTrim = name.trim()
  const contentTrim = content.trim()
  const panelOpen = editing && contentStep && nameTrim.length > 0
  const canSubmit = nameTrim.length > 0 && contentTrim.length > 0 && !saving
  const useInlineContent = embedded

  const inlineFieldClassName =
    "w-full rounded-lg border border-grid-line bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent/40 focus:outline-none disabled:opacity-50"
  const popupFieldClassName =
    "w-full rounded-lg border border-grid-line bg-tile px-3 py-2 text-sm text-foreground placeholder:text-muted shadow-lg focus:border-accent/40 focus:outline-none disabled:opacity-50"

  useEffect(() => {
    if (initialTitle.length > 0) {
      setName(initialTitle)
      setEditing(true)
      setContentStep(initialContentStep)
    }
  }, [initialContentStep, initialTitle])

  useEffect(() => {
    if (!editing) return
    const id = requestAnimationFrame(() => {
      if (contentStep) contentRef.current?.focus()
      else nameRef.current?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [contentStep, editing])

  const closeEditing = useCallback(() => {
    setEditing(!embedded)
    setContentStep(false)
    setName("")
    setContent("")
    onDismiss?.()
  }, [embedded, onDismiss])

  const backToTitleStep = useCallback(() => {
    setContentStep(false)
    setContent("")
    requestAnimationFrame(() => nameRef.current?.focus())
  }, [])

  function advanceToContentStep() {
    if (nameTrim.length === 0) return
    setContentStep(true)
  }

  useEffect(() => {
    if (!saving) return
    setName("")
    setContent("")
    setContentStep(false)
    if (!embedded) setEditing(false)
  }, [embedded, saving])

  useEffect(() => {
    if (nameTrim.length === 0) setContentStep(false)
  }, [nameTrim.length])

  useEffect(() => {
    if (!editing) return
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      if (target instanceof Element && target.closest("[data-note-add-panel]")) return
      closeEditing()
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [closeEditing, editing])

  useEffect(() => {
    if (!panelOpen || saving) return
    const id = requestAnimationFrame(() => contentRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [panelOpen, saving])

  async function submit() {
    if (!canSubmit) return
    const ok = await onCreate(nameTrim, contentTrim)
    if (ok) {
      setName("")
      setContent("")
      setContentStep(false)
      if (!embedded) setEditing(false)
      onDismiss?.()
    }
  }

  function startEditing() {
    if (saving) return
    setEditing(true)
  }

  const contentField = (
    <textarea
      ref={contentRef}
      value={content}
      rows={embedded ? 5 : 4}
      disabled={saving}
      placeholder="Note content…"
      title={NOTE_CONTENT_HINT}
      onChange={(e) => setContent(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") closeEditing()
        if (e.key === "Backspace" && content.length === 0) {
          e.preventDefault()
          backToTitleStep()
          return
        }
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault()
          void submit()
        }
      }}
      className={`${useInlineContent ? inlineFieldClassName : popupFieldClassName} ${embedded ? "min-h-[7rem] resize-y" : "min-h-[6rem] resize-y"}`}
    />
  )

  return (
    <div ref={rootRef} className={className}>
      <div
        ref={anchorRef}
        className={`relative flex h-9 shrink-0 items-center rounded-lg border border-grid-line transition-[width,background-color] duration-200 ease-out ${
          embedded ? "w-full" : FIELD_WIDTH_CLASS
        } ${editing ? "bg-tile px-2 shadow-sm overflow-visible" : "bg-transparent px-2 hover:bg-tile overflow-hidden"}`}
      >
        {saving ? (
          <span className="flex h-9 w-full items-center justify-center whitespace-nowrap text-xs font-medium text-muted">
            Saving…
          </span>
        ) : !editing && !embedded ? (
          <button
            type="button"
            onClick={startEditing}
            title={NOTE_TITLE_HINT}
            className="flex h-9 w-full items-center justify-start gap-1 whitespace-nowrap text-xs font-medium text-muted hover:text-foreground"
          >
            <span className="inline-flex shrink-0" aria-hidden>
              <IconPlus />
            </span>
            <span>{triggerLabel}</span>
          </button>
        ) : (
          <input
            ref={nameRef}
            type="text"
            value={name}
            disabled={saving}
            placeholder="Note title…"
            title={NOTE_TITLE_HINT}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeEditing()
              if (e.key === "Backspace" && name.length === 0) {
                e.preventDefault()
                closeEditing()
                return
              }
              const forward = (e.key === "Enter" || e.key === "Tab") && !e.shiftKey
              if (forward && nameTrim.length > 0) {
                e.preventDefault()
                advanceToContentStep()
              }
            }}
            className="h-9 min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
        )}
      </div>

      {useInlineContent && panelOpen && !saving ? (
        <div data-note-add-panel className="mt-2 w-full">
          {contentField}
        </div>
      ) : null}

      {!useInlineContent ? (
        <AnchoredPopupPanel
          bare={false}
          open={panelOpen && !saving}
          anchorRef={anchorRef}
          dataAttribute="data-note-add-panel"
          widthClassName={FIELD_WIDTH_CLASS}
        >
          {contentField}
        </AnchoredPopupPanel>
      ) : null}
    </div>
  )
}