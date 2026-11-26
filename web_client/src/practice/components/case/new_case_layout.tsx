import { TextArea, TextField } from "@/core/components/atoms/text_field"
import { PrimaryActionButton } from "@/practice/components/session/primary_action_button"
import { useEffect, useRef, useState } from "react"

type NewCaseLayoutProps = {
  readonly open: boolean
  readonly saving?: boolean
  readonly onCancel: () => void
  readonly onCreate: (value: string, meaning: string) => void
}

export function NewCaseLayout({ open, saving, onCancel, onCreate }: NewCaseLayoutProps) {
  const [caseValue, setCaseValue] = useState("")
  const [meaning, setMeaning] = useState("")
  const valueRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setCaseValue("")
    setMeaning("")
    valueRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onCancel])

  if (!open) return null

  const canSubmit = caseValue.trim().length > 0 && !saving

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" role="presentation" onClick={onCancel}>
      <form
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-grid-line bg-card p-5"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          if (canSubmit) onCreate(caseValue, meaning)
        }}
      >
        <p className="text-lg font-semibold text-foreground">New case</p>
        <p className="mt-1 text-sm text-muted">Value and description for this word.</p>
        <label className="mt-4 flex flex-col gap-1 text-xs text-muted">
          Value
          <TextField
            ref={valueRef}
            value={caseValue}
            disabled={saving}
            onChange={(e) => setCaseValue(e.target.value)}
            placeholder="Word or phrase"
          />
        </label>
        <label className="mt-3 flex flex-col gap-1 text-xs text-muted">
          Description
          <TextArea
            value={meaning}
            disabled={saving}
            rows={3}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder="Meaning or notes"
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-lg border border-grid-line px-3 py-2 text-sm text-foreground hover:bg-tile disabled:opacity-50"
          >
            Cancel
          </button>
          <PrimaryActionButton type="submit" disabled={!canSubmit} className="px-4 py-2 text-sm">
            {saving ? "Adding…" : "Add"}
          </PrimaryActionButton>
        </div>
      </form>
    </div>
  )
}