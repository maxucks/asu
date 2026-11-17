import type { PracticeGradeDto } from "@/practice/practice_repository"

const BUTTONS: ReadonlyArray<{ grade: PracticeGradeDto; label: string; hint: string; className: string }> = [
  { grade: "hard", label: "Hard", hint: "Barely remembered", className: "border-danger/60 bg-danger/15 hover:bg-danger/25" },
  { grade: "medium", label: "Medium", hint: "Recalled with effort", className: "border-warn/60 bg-warn/15 hover:bg-warn/25" },
  { grade: "easy", label: "Easy", hint: "Instant recall", className: "border-success/60 bg-success/15 hover:bg-success/25" },
]

export function Grades({
  onGrade,
  disabled,
}: {
  readonly onGrade: (grade: PracticeGradeDto) => void
  readonly disabled?: boolean
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {BUTTONS.map((btn) => (
        <button
          key={btn.grade}
          type="button"
          disabled={disabled}
          onClick={() => onGrade(btn.grade)}
          className={`rounded-xl border px-4 py-4 text-center transition disabled:opacity-40 ${btn.className}`}
        >
          <div className="text-base font-semibold text-foreground">{btn.label}</div>
          <div className="mt-1 text-xs text-muted">{btn.hint}</div>
        </button>
      ))}
    </div>
  )
}