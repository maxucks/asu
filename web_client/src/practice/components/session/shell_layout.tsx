import { CardLayout, type CardLayoutProps } from "@/practice/components/session/card_layout"
import { FooterLayout } from "@/practice/components/session/footer_layout"
import { HeaderLayout } from "@/practice/components/session/header_layout"
import type { PracticeGradeDto } from "@/practice/practice_repository"
import type { ReactNode } from "react"

type ShellLayoutProps = CardLayoutProps & {
  readonly language?: string
  readonly progress: string
  readonly onReveal: () => void
  readonly onGrade: (grade: PracticeGradeDto) => void
  readonly onNewCase: () => void
  readonly overlays: ReactNode
}

export function ShellLayout(props: ShellLayoutProps) {
  const { language, progress, onReveal, onGrade, onNewCase, overlays, ...card } = props

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col gap-6 p-6 pb-10">
      <HeaderLayout language={language} progress={progress} />
      <CardLayout {...card} />
      <FooterLayout onFront={card.onFront} onReveal={onReveal} onGrade={onGrade} />
      <button
        type="button"
        aria-label="Add vocabulary entry"
        onClick={onNewCase}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-light text-white shadow-lg transition hover:brightness-110"
      >
        +
      </button>
      {overlays}
    </main>
  )
}