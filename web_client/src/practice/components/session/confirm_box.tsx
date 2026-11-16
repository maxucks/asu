import { useEffect, useRef } from "react"

export function ConfirmBox(props: {
  readonly open: boolean
  readonly title: string
  readonly message: string
  readonly confirmLabel?: string
  readonly cancelLabel?: string
  readonly busy?: boolean
  readonly onConfirm: () => void
  readonly onCancel: () => void
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const { open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", busy, onConfirm, onCancel } = props

  useEffect(() => {
    if (open) cancelRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-slate-600 bg-slate-900 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg font-medium text-slate-100">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button ref={cancelRef} type="button" disabled={busy} onClick={onCancel} className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white">
            {cancelLabel}
          </button>
          <button type="button" disabled={busy} onClick={onConfirm} className="rounded-lg bg-danger px-3 py-2 text-sm font-medium text-white disabled:opacity-40">
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}