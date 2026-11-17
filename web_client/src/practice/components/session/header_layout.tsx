type HeaderLayoutProps = {
  readonly languageIcon?: string
  readonly languageName?: string
  readonly progress: string
  readonly onOpenLanguages: () => void
  readonly onOpenCaseLibrary?: () => void
}

export function HeaderLayout({
  languageIcon,
  languageName,
  progress,
  onOpenLanguages,
  onOpenCaseLibrary,
}: HeaderLayoutProps) {
  return (
    <header className="flex items-center justify-between gap-3 text-sm">
      <button
        type="button"
        onClick={onOpenLanguages}
        className="flex min-w-0 max-w-[55%] items-center gap-2 rounded-lg border border-grid-line bg-tile px-3 py-2 text-left transition hover:border-accent/40"
      >
        <span className="text-lg leading-none" aria-hidden>
          {languageIcon ?? "🌐"}
        </span>
        <span className="truncate font-medium text-foreground">{languageName ?? "Language"}</span>
        <span className="text-xs text-muted">▼</span>
      </button>
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