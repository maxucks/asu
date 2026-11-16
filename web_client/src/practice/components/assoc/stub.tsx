export function AssocStub({
  kind,
  label,
  stacked,
  tile,
}: {
  readonly kind: string
  readonly label: string
  readonly stacked?: boolean
  readonly tile?: boolean
}) {
  if (tile) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-1 bg-tile p-2 text-center text-xs text-muted" aria-label={`${kind} association placeholder`}>
        <span className="uppercase tracking-wide text-[10px]">{kind}</span>
        <span className="leading-snug">{label}</span>
      </div>
    )
  }

  return (
    <div
      className={`flex min-h-18 rounded-lg border border-dashed border-grid-line bg-tile px-4 py-3 text-sm text-muted ${
        stacked ? "flex-col items-center justify-center gap-1" : "items-center justify-center"
      }`}
      aria-label={`${kind} association placeholder`}
    >
      <span className="uppercase tracking-wide text-[10px]">{kind}</span>
      {stacked ? (
        <span>{label}</span>
      ) : (
        <>
          <span className="mx-2 text-grid-line">·</span>
          <span>{label}</span>
        </>
      )}
    </div>
  )
}