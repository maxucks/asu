import { textFieldClassName } from "@/core/components/atoms/text_field"
import type { ReactNode } from "react"

export const composeFieldClass = `${textFieldClassName} bg-tile`

export function ComposeShellLayout(props: {
  readonly title: string
  readonly saving?: boolean
  readonly submitDisabled?: boolean
  readonly submitLabel?: string
  readonly hint?: ReactNode
  readonly onCancel: () => void
  readonly onSubmit: () => void
  readonly children: ReactNode
}) {
  const { title, saving, submitDisabled, submitLabel = "Add", hint, onCancel, onSubmit, children } = props
  return (
    <form
      className="flex flex-col gap-2 border border-grid-line bg-tile p-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <label className="text-xs font-medium uppercase tracking-wide text-muted">{title}</label>
      {children}
      {hint}
      <div className="flex justify-end gap-2">
        <button type="button" disabled={saving} onClick={onCancel} className="rounded-lg px-3 py-1.5 text-sm text-muted hover:text-foreground">
          Cancel
        </button>
        <button type="submit" disabled={saving || submitDisabled} className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground disabled:opacity-40">
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  )
}