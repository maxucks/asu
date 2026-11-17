import { HeaderLayout } from "@/practice/components/session/header_layout"
import type { ReactNode } from "react"

type EmptyQueueLayoutProps = {
  readonly languageIcon?: string
  readonly languageName?: string
  readonly categoryLabel?: string
  readonly categoryCount?: number
  readonly categoryActive?: boolean
  readonly onOpenCategory?: () => void
  readonly onClearCategory?: () => void
  readonly onOpenLanguages: () => void
  readonly onOpenCaseLibrary: () => void
  readonly categoryModal?: ReactNode
  readonly overlays?: ReactNode
}

export function EmptyQueueLayout({
  languageIcon,
  languageName,
  categoryLabel,
  categoryCount,
  categoryActive,
  onOpenCategory,
  onClearCategory,
  onOpenLanguages,
  onOpenCaseLibrary,
  categoryModal,
  overlays,
}: EmptyQueueLayoutProps) {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col gap-6 p-6 pb-10">
      {categoryModal}
      <HeaderLayout
        languageIcon={languageIcon}
        languageName={languageName}
        progress="—"
        categoryLabel={categoryLabel}
        categoryCount={categoryCount}
        categoryActive={categoryActive}
        onOpenCategory={onOpenCategory}
        onClearCategory={onClearCategory}
        onOpenLanguages={onOpenLanguages}
        onOpenCaseLibrary={onOpenCaseLibrary}
      />
      <section className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-grid-line bg-card px-6 py-12 text-center">
        <p className="text-lg font-semibold text-foreground">No vocabulary yet</p>
        <p className="max-w-xs text-sm text-muted">Open the library to add your first word for this language.</p>
        <button
          type="button"
          onClick={onOpenCaseLibrary}
          className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:brightness-110"
        >
          Open library
        </button>
      </section>
      {overlays}
    </main>
  )
}