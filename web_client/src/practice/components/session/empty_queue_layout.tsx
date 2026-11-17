import { AddCaseFab } from "@/practice/components/session/add_case_fab"
import { HeaderLayout } from "@/practice/components/session/header_layout"
import type { ReactNode } from "react"

type EmptyQueueLayoutProps = {
  readonly languageIcon?: string
  readonly languageName?: string
  readonly onOpenLanguages: () => void
  readonly onAddCase: () => void
  readonly overlays: ReactNode
}

export function EmptyQueueLayout({
  languageIcon,
  languageName,
  onOpenLanguages,
  onAddCase,
  overlays,
}: EmptyQueueLayoutProps) {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col gap-6 p-6 pb-10">
      <HeaderLayout languageIcon={languageIcon} languageName={languageName} progress="—" onOpenLanguages={onOpenLanguages} />
      <section className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-grid-line bg-card px-6 py-12 text-center shadow-lg">
        <p className="text-lg font-semibold text-foreground">No vocabulary yet</p>
        <p className="max-w-xs text-sm text-muted">Add your first word for this language to start practicing.</p>
        <button
          type="button"
          onClick={onAddCase}
          className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:brightness-110"
        >
          Add entry
        </button>
      </section>
      <AddCaseFab onClick={onAddCase} />
      {overlays}
    </main>
  )
}