type LanguageFormActionsProps = {
  readonly saveLabel?: string
  readonly onCancel: () => void
  readonly onSave: () => void
  readonly saving?: boolean
}

export function LanguageFormActions({
  saveLabel = "Save",
  onCancel,
  onSave,
  saving,
}: LanguageFormActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        disabled={saving}
        onClick={onCancel}
        className="rounded-lg border border-grid-line bg-tile px-3 py-1.5 text-sm font-medium text-foreground transition hover:border-muted disabled:opacity-40"
      >
        Cancel
      </button>
      <button
        type="button"
        disabled={saving}
        onClick={onSave}
        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground transition disabled:opacity-40"
      >
        {saving ? "Saving…" : saveLabel}
      </button>
    </div>
  )
}