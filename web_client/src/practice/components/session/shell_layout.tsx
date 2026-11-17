import { AddCaseFab } from "@/practice/components/session/add_case_fab"
import { CardLayout, type CardLayoutProps } from "@/practice/components/session/card_layout"
import { FooterLayout } from "@/practice/components/session/footer_layout"
import { HeaderLayout } from "@/practice/components/session/header_layout"
import type { PracticeGradeDto } from "@/practice/practice_repository"
import type { ReactNode } from "react"

type ShellLayoutProps = CardLayoutProps & {
  readonly languageIcon?: string
  readonly languageName?: string
  readonly progress: string
  readonly onOpenLanguages: () => void
  readonly onReveal: () => void
  readonly onGrade: (grade: PracticeGradeDto) => void
  readonly onNewCase: () => void
  readonly overlays: ReactNode
}

export function ShellLayout(props: ShellLayoutProps) {
  const { languageIcon, languageName, progress, onOpenLanguages, onReveal, onGrade, onNewCase, overlays, ...card } = props

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col gap-6 p-6 pb-10">
      <HeaderLayout
        languageIcon={languageIcon}
        languageName={languageName}
        progress={progress}
        onOpenLanguages={onOpenLanguages}
      />
      <CardLayout {...card} />
      <FooterLayout onFront={card.onFront} onReveal={onReveal} onGrade={onGrade} />
      <AddCaseFab onClick={onNewCase} />
      {overlays}
    </main>
  )
}