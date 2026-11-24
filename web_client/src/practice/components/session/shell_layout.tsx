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
  readonly onOpenCaseLibrary?: () => void
  readonly categoryLabel?: string
  readonly categoryCount?: number
  readonly categoryActive?: boolean
  readonly onOpenCategory?: () => void
  readonly onClearCategory?: () => void
  readonly onReveal: () => void
  readonly onGrade: (grade: PracticeGradeDto) => void
  readonly grading?: boolean
  readonly overlays: ReactNode
  readonly caseCategories?: ReactNode
}

export function ShellLayout(props: ShellLayoutProps) {
  const {
    languageIcon,
    languageName,
    progress,
    onOpenLanguages,
    onOpenCaseLibrary,
    categoryLabel,
    categoryCount,
    categoryActive,
    onOpenCategory,
    onClearCategory,
    onReveal,
    onGrade,
    grading,
    overlays,
    caseCategories,
    ...card
  } = props

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col gap-6 p-6 pb-10">
      <HeaderLayout
        languageIcon={languageIcon}
        languageName={languageName}
        progress={progress}
        categoryLabel={categoryLabel}
        categoryCount={categoryCount}
        categoryActive={categoryActive}
        onOpenCategory={onOpenCategory}
        onClearCategory={onClearCategory}
        onOpenLanguages={onOpenLanguages}
        onOpenCaseLibrary={onOpenCaseLibrary}
      />
      <CardLayout {...card} caseCategories={caseCategories} />
      <FooterLayout onFront={card.onFront} grading={grading} onReveal={onReveal} onGrade={onGrade} />
      {overlays}
    </main>
  )
}