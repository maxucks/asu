type HeaderLayoutProps = {
  readonly languageIcon?: string
  readonly languageName?: string
  readonly progress: string
  readonly onOpenLanguages: () => void
}

export function HeaderLayout({ languageIcon, languageName, progress, onOpenLanguages }: HeaderLayoutProps) {
  return (
    <header className="flex items-center justify-between gap-3 text-sm">
      <button
        type="button"
        onClick={onOpenLanguages}
        className="flex min-w-0 max-w-[70%] items-center gap-2 rounded-lg border border-grid-line bg-tile px-3 py-2 text-left transition hover:border-accent/40"
      >
        <span className="text-lg leading-none" aria-hidden>
          {languageIcon ?? "🌐"}
        </span>
        <span className="truncate font-medium text-foreground">{languageName ?? "Language"}</span>
        <span className="text-xs text-muted">▼</span>
      </button>
      <span className="shrink-0 tabular-nums text-muted">{progress}</span>
    </header>
  )
}