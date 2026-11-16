import { Grades } from "@/practice/components/session/grades"
import type { PracticeGradeDto } from "@/practice/practice_repository"

type FooterLayoutProps = {
  readonly onFront: boolean
  readonly onReveal: () => void
  readonly onGrade: (grade: PracticeGradeDto) => void
}

export function FooterLayout({ onFront, onReveal, onGrade }: FooterLayoutProps) {
  return (
    <footer className="mt-auto">
      {onFront ? (
        <button
          type="button"
          onClick={onReveal}
          className="w-full rounded-xl bg-accent px-4 py-3.5 text-base font-semibold text-accent-foreground transition hover:brightness-110"
        >
          Show answer
        </button>
      ) : (
        <Grades onGrade={onGrade} />
      )}
    </footer>
  )
}