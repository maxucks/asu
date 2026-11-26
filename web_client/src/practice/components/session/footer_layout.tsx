import { Grades } from "@/practice/components/session/grades"
import { PrimaryActionButton } from "@/practice/components/session/primary_action_button"
import type { PracticeGradeDto } from "@/practice/practice_repository"

type FooterLayoutProps = {
  readonly onFront: boolean
  readonly grading?: boolean
  readonly disabled?: boolean
  readonly onReveal: () => void
  readonly onGrade: (grade: PracticeGradeDto) => void
}

export function FooterLayout({ onFront, grading, disabled, onReveal, onGrade }: FooterLayoutProps) {
  return (
    <footer className="mt-auto">
      {onFront ? (
        <PrimaryActionButton type="button" disabled={disabled} onClick={onReveal}>
          Show answer
        </PrimaryActionButton>
      ) : (
        <Grades onGrade={onGrade} disabled={grading || disabled} />
      )}
    </footer>
  )
}