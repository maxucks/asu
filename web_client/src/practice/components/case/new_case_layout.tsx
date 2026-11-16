import { TextArea, TextField } from "@/core/components/atoms/text_field"
import { useEffect, useRef, useState } from "react"

type NewCaseLayoutProps = {
  readonly open: boolean
  readonly saving?: boolean
  readonly onCancel: () => void
  readonly onCreate: (lemma: string, meaning: string) => void
}

export function NewCaseLayout({ open, saving, onCancel, onCreate }: NewCaseLayoutProps) {
  const [lemma, setLemma] = useState("")
  const [meaning, setMeaning] = useState("")
  const lemmaRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setLemma("")
    setMeaning("")
    lemmaRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onCancel])

  if (!open) return null

  const canSubmit = lemma.trim().length > 0 && !saving

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation" onClick={onCancel}>
      <form
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-slate-600 bg-slate-900 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          if (canSubmit) onCreate(lemma, meaning)
        }}
      >
        <p className="text-lg font-medium text-slate-100">New entry</p>
        <p className="mt-1 text-sm text-slate-400">Lemma and description for this word.</p>
        <label className="mt-4 flex flex-col gap-1 text-xs text-slate-500">
          Lemma
          <TextField ref={lemmaRef} value={lemma} disabled={saving} onChange={(e) => setLemma(e.target.value)} placeholder="Word or phrase" />
        </label>
        <label className="mt-3 flex flex-col gap-1 text-xs text-slate-500">
          Description
          <TextArea value={meaning} disabled={saving} rows={3} onChange={(e) => setMeaning(e.target.value)} placeholder="Meaning or notes" />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" disabled={saving} onClick={onCancel} className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white">
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit} className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-40">
            {saving ? "Adding…" : "Add"}
          </button>
        </div>
      </form>
    </div>
  )
}