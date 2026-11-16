type HeaderLayoutProps = {
  readonly language?: string
  readonly progress: string
}

export function HeaderLayout({ language, progress }: HeaderLayoutProps) {
  return (
    <header className="flex items-center justify-between text-sm text-slate-400">
      <span>{language}</span>
      <span>{progress}</span>
    </header>
  )
}