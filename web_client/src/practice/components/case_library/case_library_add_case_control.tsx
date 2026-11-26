"use client"

import { AnchoredPopupPanel } from "@/practice/components/category/anchored_popup_panel"
import { PrimaryActionButton } from "@/practice/components/session/primary_action_button"
import { IconPlus } from "@/practice/components/session/icon_button"
import { parseCaseValue } from "@/practice/practice_model"
import { emptyRepresentationDrafts, formatRepresentationTypeLabel } from "@/practice/practice_representation"
import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import { useEffect, useRef, useState } from "react"

const ADD_CASE_HINT = "Save a new word to this language's vocabulary."
const VALUE_HINT = "Type the word or phrase as you'd meet it in the wild."
const MEANING_HINT =
  "A short cue to jog your memory—skip the direct translation so you still recall the word in the original language."

const FIELD_WIDTH_CLASS = "w-64"

type CaseLibraryAddCaseControlProps = {
  readonly representationTypes: readonly RepresentationTypeDto[]
  readonly saving?: boolean
  readonly onCreate: (
    value: string,
    meaning: string,
    representationDrafts: Record<number, string>,
  ) => boolean | Promise<boolean>
  readonly className?: string
}

export function CaseLibraryAddCaseControl({
  representationTypes,
  saving,
  onCreate,
  className,
}: CaseLibraryAddCaseControlProps) {
  const [editing, setEditing] = useState(false)
  const [detailsStep, setDetailsStep] = useState(false)
  const [caseValue, setCaseValue] = useState("")
  const [meaning, setMeaning] = useState("")
  const [representationDrafts, setRepresentationDrafts] = useState<Record<number, string>>(() =>
    emptyRepresentationDrafts(representationTypes),
  )
  const rootRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const valueRef = useRef<HTMLInputElement>(null)
  const meaningRef = useRef<HTMLInputElement>(null)

  const valueTrim = caseValue.trim()
  const meaningTrim = meaning.trim()
  const panelOpen = editing && detailsStep && valueTrim.length > 0
  const canSubmit = valueTrim.length > 0 && meaningTrim.length > 0 && !saving

  const fieldClassName = `h-9 w-full rounded-lg border border-grid-line bg-tile px-3 text-sm text-foreground placeholder:text-muted shadow-lg focus:border-accent/40 focus:outline-none disabled:opacity-50`

  useEffect(() => {
    setRepresentationDrafts(emptyRepresentationDrafts(representationTypes))
  }, [representationTypes])

  useEffect(() => {
    if (!editing) return
    const id = requestAnimationFrame(() => valueRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [editing])

  useEffect(() => {
    if (saving) setEditing(false)
  }, [saving])

  useEffect(() => {
    if (!editing) return
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      if (target instanceof Element && target.closest("[data-case-add-panel]")) return
      setEditing(false)
      setDetailsStep(false)
      setCaseValue("")
      setMeaning("")
      setRepresentationDrafts(emptyRepresentationDrafts(representationTypes))
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [editing, representationTypes])

  useEffect(() => {
    if (!panelOpen || saving) return
    const id = requestAnimationFrame(() => meaningRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [panelOpen, saving])

  function startEditing() {
    if (saving) return
    setEditing(true)
  }

  function closeEditing() {
    setEditing(false)
    setDetailsStep(false)
    setCaseValue("")
    setMeaning("")
    setRepresentationDrafts(emptyRepresentationDrafts(representationTypes))
  }

  function advanceToDetailsStep() {
    if (valueTrim.length === 0) return
    setDetailsStep(true)
  }

  function backToValueStep() {
    setDetailsStep(false)
    setMeaning("")
    setRepresentationDrafts(emptyRepresentationDrafts(representationTypes))
    requestAnimationFrame(() => valueRef.current?.focus())
  }

  useEffect(() => {
    if (valueTrim.length === 0) setDetailsStep(false)
  }, [valueTrim.length])

  async function submit() {
    if (!canSubmit) return
    const value = parseCaseValue(caseValue)
    if (value === null) return
    const ok = await onCreate(value, meaningTrim, representationDrafts)
    if (ok) closeEditing()
  }

  return (
    <div ref={rootRef} className={className}>
      <div
        ref={anchorRef}
        className={`relative flex h-9 shrink-0 items-center rounded-lg border border-grid-line transition-[width,background-color] duration-200 ease-out ${FIELD_WIDTH_CLASS} ${
          editing ? "bg-tile px-2 shadow-sm overflow-visible" : "bg-transparent px-2 hover:bg-tile overflow-hidden"
        }`}
      >
        {saving ? (
          <span className="flex h-9 w-full items-center justify-center whitespace-nowrap text-xs font-medium text-muted">
            Adding…
          </span>
        ) : !editing ? (
          <button
            type="button"
            onClick={startEditing}
            title={ADD_CASE_HINT}
            className="flex h-9 w-full items-center justify-start gap-1 whitespace-nowrap text-xs font-medium text-muted hover:text-foreground"
          >
            <span className="inline-flex shrink-0" aria-hidden>
              <IconPlus />
            </span>
            <span>Add case</span>
          </button>
        ) : (
          <input
            ref={valueRef}
            type="text"
            value={caseValue}
            disabled={saving}
            placeholder="Word or phrase…"
            title={VALUE_HINT}
            onChange={(e) => setCaseValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeEditing()
              if (e.key === "Backspace" && caseValue.length === 0) {
                e.preventDefault()
                closeEditing()
                return
              }
              const forward = (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) && valueTrim.length > 0
              if (forward) {
                e.preventDefault()
                advanceToDetailsStep()
              }
            }}
            className="h-9 min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
        )}
      </div>

      <AnchoredPopupPanel
        bare
        open={panelOpen && !saving}
        anchorRef={anchorRef}
        dataAttribute="data-case-add-panel"
        widthClassName={FIELD_WIDTH_CLASS}
      >
        <div className="flex flex-col gap-2">
          {representationTypes.map((type) => (
            <label key={type.id} className="flex flex-col gap-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
              {formatRepresentationTypeLabel(type.name)}
              <input
                type="text"
                value={representationDrafts[type.id] ?? ""}
                disabled={saving}
                onChange={(e) =>
                  setRepresentationDrafts((prev) => ({ ...prev, [type.id]: e.target.value }))
                }
                className={fieldClassName}
              />
            </label>
          ))}
          <input
            ref={meaningRef}
            type="text"
            value={meaning}
            disabled={saving}
            placeholder="Memory cue (no spoilers)…"
            title={MEANING_HINT}
            onChange={(e) => setMeaning(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeEditing()
              if (e.key === "Backspace" && meaning.length === 0) {
                e.preventDefault()
                backToValueStep()
                return
              }
              if (e.key === "Enter") {
                e.preventDefault()
                void submit()
              }
            }}
            className={fieldClassName}
          />
          {canSubmit ? (
            <PrimaryActionButton type="button" size="compact" className="shadow-lg" onClick={() => void submit()}>
              Add case
            </PrimaryActionButton>
          ) : null}
        </div>
      </AnchoredPopupPanel>
    </div>
  )
}