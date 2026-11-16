type HeaderLayoutProps = {
  readonly language?: string
  readonly progress: string
}

export function HeaderLayout({ language, progress }: HeaderLayoutProps) {
  return (
    <header className="flex items-center justify-between text-sm text-muted">
      <span className="font-medium text-foreground/80">{language}</span>
      <span className="tabular-nums">{progress}</span>
    </header>
  )
}