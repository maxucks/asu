import { TextArea, TextField } from "@/core/components/atoms/text_field"
import { LanguageFormActions } from "@/practice/components/language/language_form_actions"
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" role="presentation" onClick={onCancel}>
      <form
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-grid-line bg-card p-5"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          if (canSubmit) onCreate(lemma, meaning)
        }}
      >
        <p className="text-lg font-semibold text-foreground">New case</p>
        <p className="mt-1 text-sm text-muted">Lemma and description for this word.</p>
        <label className="mt-4 flex flex-col gap-1 text-xs text-muted">
          Lemma
          <TextField ref={lemmaRef} value={lemma} disabled={saving} onChange={(e) => setLemma(e.target.value)} placeholder="Word or phrase" />
        </label>
        <label className="mt-3 flex flex-col gap-1 text-xs text-muted">
          Description
          <TextArea value={meaning} disabled={saving} rows={3} onChange={(e) => setMeaning(e.target.value)} placeholder="Meaning or notes" />
        </label>
        <div className="mt-5">
          <LanguageFormActions
            saveLabel={saving ? "Adding…" : "Add"}
            saving={saving}
            onCancel={onCancel}
            onSave={() => {
              if (canSubmit) onCreate(lemma, meaning)
            }}
          />
        </div>
      </form>
    </div>
  )
}