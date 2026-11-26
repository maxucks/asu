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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-box-title"
        className="w-full max-w-sm rounded-2xl border border-grid-line bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="confirm-box-title" className="text-lg font-semibold text-foreground">
          {title}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-lg border border-grid-line bg-tile px-3 py-2 text-sm font-medium text-foreground transition hover:border-accent/40 disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="rounded-lg border border-danger/40 bg-danger px-3 py-2 text-sm font-medium text-white transition hover:border-danger/60 disabled:opacity-40"
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}