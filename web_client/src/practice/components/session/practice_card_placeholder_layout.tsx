const PLACEHOLDER_TILE_CLASS = "rounded-xl border border-grid-line bg-tile"

export function PracticeCardPlaceholderLayout() {
  return (
    <section className="flex min-h-[min(70vh,32rem)] flex-1 flex-col overflow-hidden rounded-2xl border border-grid-line bg-card shadow-lg">
      <div className="space-y-3 border-b border-grid-line px-5 py-5">
        <div className="h-3 w-14 rounded border border-grid-line bg-tile" aria-hidden />
        <div className="h-7 w-52 max-w-[80%] rounded border border-grid-line bg-tile" aria-hidden />
        <div className="h-4 w-full max-w-md rounded border border-grid-line bg-tile/80" aria-hidden />
        <div className="h-8 w-full rounded-lg border border-grid-line bg-tile/60" aria-hidden />
      </div>
      <div className="grid min-h-[12rem] flex-1 grid-cols-2 gap-2 p-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className={`min-h-24 ${PLACEHOLDER_TILE_CLASS}`} aria-hidden />
        ))}
      </div>
    </section>
  )
}

export function PracticeNotesPlaceholder() {
  return (
    <div className="w-full" aria-hidden>
      <div className="mb-1.5 flex items-center justify-between gap-2 px-0.5">
        <div className="h-3 w-10 rounded border border-grid-line bg-tile" />
        <div className="h-8 w-36 rounded-lg border border-grid-line bg-tile" />
      </div>
      <div className="flex gap-2 pb-1">
        <div className="h-20 w-40 shrink-0 rounded-xl border border-grid-line bg-tile" />
        <div className="h-20 w-40 shrink-0 rounded-xl border border-grid-line bg-tile/80" />
      </div>
    </div>
  )
}