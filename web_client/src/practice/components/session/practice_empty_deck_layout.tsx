type PracticeEmptyDeckLayoutProps = {
  readonly categoryActive?: boolean
  readonly onOpenLibrary?: () => void
  readonly onClearCategory?: () => void
}

export function PracticeEmptyDeckLayout({
  categoryActive,
  onOpenLibrary,
  onClearCategory,
}: PracticeEmptyDeckLayoutProps) {
  return (
    <section className="flex flex-col items-center gap-3 rounded-2xl border border-grid-line bg-card px-6 py-10 text-center">
      <p className="text-base font-semibold text-foreground">
        {categoryActive ? "No cards in this category" : "No vocabulary yet"}
      </p>
      <p className="max-w-xs text-sm text-muted">
        {categoryActive
          ? "Clear the category filter or add entries in the library."
          : "Open the library to add your first word for this language."}
      </p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        {categoryActive && onClearCategory ? (
          <button
            type="button"
            onClick={onClearCategory}
            className="rounded-lg border border-grid-line bg-tile px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent/40"
          >
            Show all cards
          </button>
        ) : null}
        {onOpenLibrary ? (
          <button
            type="button"
            onClick={onOpenLibrary}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:brightness-110"
          >
            Open library
          </button>
        ) : null}
      </div>
    </section>
  )
}