import type { ReactNode } from "react"

type AddAssociationComposeShellUiProps = {
  readonly title: string
  readonly onCancel: () => void
  readonly onSubmit: () => void
  readonly saving?: boolean
  readonly submitDisabled?: boolean
  readonly submitLabel?: string
  readonly hint?: ReactNode
  readonly children: ReactNode
}

export function AddAssociationComposeShellUi({
  title,
  onCancel,
  onSubmit,
  saving,
  submitDisabled,
  submitLabel = "Add",
  hint,
  children,
}: AddAssociationComposeShellUiProps) {
  return (
    <form
      className="flex flex-col gap-2 rounded-lg border border-slate-600 bg-slate-800/80 p-3"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <label className="text-xs font-medium uppercase tracking-wide text-slate-400">{title}</label>
      {children}
      {hint}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || submitDisabled}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  )
}

export const associationComposeFieldClassName =
  "rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none"
