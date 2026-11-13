type AssociationPlaceholderUiProps = {
  readonly kind: string
  readonly label: string
  readonly layout?: "inline" | "stacked"
}

export function AssociationPlaceholderUi({ kind, label, layout = "inline" }: AssociationPlaceholderUiProps) {
  const stacked = layout === "stacked"

  return (
    <div
      className={`flex min-h-18 rounded-lg border border-dashed border-slate-600 bg-slate-900/50 px-4 py-3 text-sm text-slate-400 ${
        stacked ? "flex-col items-center justify-center gap-1" : "items-center justify-center"
      }`}
      aria-label={`${kind} association placeholder`}
    >
      <span className="uppercase tracking-wide text-xs text-slate-500">{kind}</span>
      {stacked ? (
        <span>{label}</span>
      ) : (
        <>
          <span className="mx-2 text-slate-600">·</span>
          <span>{label}</span>
        </>
      )}
    </div>
  )
}
