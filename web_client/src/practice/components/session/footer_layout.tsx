import { Grades } from "@/practice/components/session/grades"
import { PrimaryActionButton } from "@/practice/components/session/primary_action_button"
import type { PracticeGradeDto } from "@/practice/practice_repository"

type FooterLayoutProps = {
  readonly onFront: boolean
  readonly grading?: boolean
  readonly onReveal: () => void
  readonly onGrade: (grade: PracticeGradeDto) => void
  readonly revealLemma?: string
}

export function FooterLayout({ onFront, grading, onReveal, onGrade, revealLemma }: FooterLayoutProps) {
  return (
    <footer className="mt-auto space-y-4">
      {onFront ? (
        <PrimaryActionButton type="button" onClick={onReveal}>
          Show answer
        </PrimaryActionButton>
      ) : (
        <>
          {revealLemma ? (
            <div className="rounded-xl border border-grid-line bg-accent-soft/40 px-4 py-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Answer</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-accent">{revealLemma}</p>
            </div>
          ) : null}
          <Grades onGrade={onGrade} disabled={grading} />
        </>
      )}
    </footer>
  )
}