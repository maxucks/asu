import { CardLayout, type CardLayoutProps } from "@/practice/components/session/card_layout"
import { HeaderLayout } from "@/practice/components/session/header_layout"
import { PracticeAnswerRail } from "@/practice/components/session/practice_answer_rail"
import type { PracticeRecallIntent } from "@/practice/practice_session_controller"
import type { StudyRecordSnapshotDto } from "@/practice/practice_study_types"
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
  readonly sessionPhase: "front" | "back"
  readonly grading?: boolean
  readonly revealLemma?: string
  readonly studyRecord: StudyRecordSnapshotDto | null
  readonly recallIntent: PracticeRecallIntent
  readonly onDontKnow: () => void
  readonly onKnow: () => void
  readonly onBackLeft: () => void
  readonly onBackRight: () => void
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
    sessionPhase,
    grading,
    revealLemma,
    studyRecord,
    recallIntent,
    onDontKnow,
    onKnow,
    onBackLeft,
    onBackRight,
    overlays,
    caseCategories,
    ...card
  } = props

  return (
    <>
      <PracticeAnswerRail
        phase={sessionPhase}
        recallIntent={recallIntent}
        grading={grading}
        revealLemma={revealLemma}
        onDontKnow={onDontKnow}
        onKnow={onKnow}
        onBackLeft={onBackLeft}
        onBackRight={onBackRight}
        header={
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
        }
      >
        <CardLayout {...card} studyRecord={studyRecord} caseCategories={caseCategories} />
      </PracticeAnswerRail>
      {overlays}
    </>
  )
}