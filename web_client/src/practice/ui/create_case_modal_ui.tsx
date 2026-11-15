import { useEffect, useRef, useState } from "react"

type CreateCaseModalUiProps = {
  readonly open: boolean
  readonly saving?: boolean
  readonly onCancel: () => void
  readonly onCreate: (lemma: string, meaning: string) => void
}

export function CreateCaseModalUi({ open, saving, onCancel, onCreate }: CreateCaseModalUiProps) {
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

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  const canSubmit = lemma.trim().length > 0 && !saving

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <h2 id="create-case-title" className="sr-only">
        New vocabulary entry
      </h2>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-case-title"
        className="w-full max-w-sm rounded-2xl border border-slate-600 bg-slate-900 p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault()
          if (!canSubmit) return
          onCreate(lemma, meaning)
        }}
      >
        <p className="text-lg font-medium text-slate-100">New entry</p>
        <p className="mt-1 text-sm text-slate-400">Lemma and description for this word.</p>

        <label className="mt-4 flex flex-col gap-1 text-xs text-slate-500">
          Lemma
          <input
            ref={lemmaRef}
            value={lemma}
            disabled={saving}
            onChange={(event) => setLemma(event.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            placeholder="Word or phrase"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1 text-xs text-slate-500">
          Description
          <textarea
            value={meaning}
            disabled={saving}
            rows={3}
            onChange={(event) => setMeaning(event.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            placeholder="Meaning or notes"
          />
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={onCancel}
            className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {saving ? "Adding…" : "Add"}
          </button>
        </div>
      </form>
    </div>
  )
}