type HeaderLayoutProps = {
  readonly languageIcon?: string
  readonly languageName?: string
  readonly categoryLabel?: string
  readonly categoryCount?: number
  readonly categoryActive?: boolean
  readonly onOpenCategory?: () => void
  readonly onClearCategory?: () => void
  readonly progress: string
  readonly onOpenLanguages: () => void
  readonly onOpenCaseLibrary?: () => void
}

export function HeaderLayout({
  languageIcon,
  languageName,
  categoryLabel,
  categoryCount,
  categoryActive,
  onOpenCategory,
  onClearCategory,
  progress,
  onOpenLanguages,
  onOpenCaseLibrary,
}: HeaderLayoutProps) {
  return (
    <header className="flex items-center justify-between gap-3 text-sm">
      <div className="flex min-w-0 max-w-[70%] items-center gap-2">
        <button
          type="button"
          onClick={onOpenLanguages}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-grid-line bg-tile px-3 py-2 text-left transition hover:border-accent/40"
        >
          <span className="text-lg leading-none" aria-hidden>
            {languageIcon ?? "🌐"}
          </span>
          <span className="truncate font-medium text-foreground">{languageName ?? "Language"}</span>
          <span className="text-xs text-muted">▼</span>
        </button>
        {onOpenCategory ? (
          <button
            type="button"
            onClick={onOpenCategory}
            className={`flex max-w-[9rem] shrink-0 items-center gap-1 rounded-lg border bg-tile px-2.5 py-2 text-left text-foreground transition hover:border-accent/40 ${
              categoryActive ? "border-foreground/35" : "border-grid-line"
            }`}
          >
            <span className="min-w-0 truncate text-xs font-medium">{categoryLabel ?? "Category"}</span>
            {categoryCount !== undefined ? (
              <span className="shrink-0 tabular-nums text-[10px] text-muted">{categoryCount}</span>
            ) : null}
            <span className="text-[10px] text-muted">▼</span>
          </button>
        ) : null}
        {categoryActive && onClearCategory ? (
          <button
            type="button"
            aria-label="Clear category filter"
            title="Clear category"
            onClick={onClearCategory}
            className="shrink-0 rounded-lg border border-grid-line px-2 py-2 text-xs text-muted transition hover:border-accent/40 hover:text-foreground"
          >
            ✕
          </button>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {onOpenCaseLibrary ? (
          <button
            type="button"
            onClick={onOpenCaseLibrary}
            aria-label="Open vocabulary library"
            title="Vocabulary"
            className="rounded-lg border border-grid-line bg-tile px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition hover:border-accent/40 hover:text-accent"
          >
            Words
          </button>
        ) : null}
        <span className="tabular-nums text-muted">{progress}</span>
      </div>
    </header>
  )
}