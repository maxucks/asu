import type { PracticeRecallIntent } from "@/practice/practice_session_controller"
import { practiceColumnClassName } from "@/practice/components/session/practice_column"
import type { ReactNode } from "react"

type PracticeAnswerRailProps = {
  readonly phase: "front" | "back"
  readonly recallIntent: PracticeRecallIntent
  readonly grading?: boolean
  readonly revealLemma?: string
  readonly header?: ReactNode
  readonly onDontKnow: () => void
  readonly onKnow: () => void
  readonly onBackLeft: () => void
  readonly onBackRight: () => void
  readonly children: ReactNode
}

export function PracticeAnswerRail({
  phase,
  recallIntent,
  grading,
  revealLemma,
  header,
  onDontKnow,
  onKnow,
  onBackLeft,
  onBackRight,
  children,
}: PracticeAnswerRailProps) {
  const recall = phase === "front"

  const backLeft =
    recallIntent === "dont_know"
      ? { label: "Didn't know", hint: "Confirm — count as missed" }
      : { label: "Wrong guess", hint: "I knew the word but guessed wrong" }

  const backRight =
    recallIntent === "dont_know"
      ? { label: "Knew it", hint: "I actually recalled it — count as correct" }
      : { label: "Correct", hint: "Nailed it — next card" }

  return (
    <div className="flex h-dvh min-h-dvh w-full max-h-dvh overflow-hidden">
      <SideRail
        side="left"
        disabled={grading}
        label={recall ? "Don't know" : backLeft.label}
        hint={recall ? "Reveal the answer first" : backLeft.hint}
        onClick={recall ? onDontKnow : onBackLeft}
      />
      <div
        className={`relative z-10 flex min-h-0 flex-col pb-[max(2.5rem,env(safe-area-inset-bottom))] ${practiceColumnClassName}`}
      >
        {header ? <div className="shrink-0 pt-4 sm:pt-6">{header}</div> : null}
        <div className="relative min-h-0 flex-1 pt-3">{children}</div>
        {phase === "back" && revealLemma ? (
          <div className="pointer-events-none absolute inset-x-4 bottom-[max(2.75rem,env(safe-area-inset-bottom))] z-20 sm:inset-x-6">
            <div className="rounded-xl border border-grid-line bg-accent-soft/60 px-3 py-2 text-center shadow-lg backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Answer</p>
              <p className="text-xl font-semibold tracking-tight text-accent">{revealLemma}</p>
            </div>
          </div>
        ) : null}
      </div>
      <SideRail
        side="right"
        disabled={grading}
        label={recall ? "Know" : backRight.label}
        hint={recall ? "Reveal and compare your guess" : backRight.hint}
        onClick={recall ? onKnow : onBackRight}
      />
    </div>
  )
}

function SideRail({
  side,
  label,
  hint,
  disabled,
  onClick,
}: {
  readonly side: "left" | "right"
  readonly label: string
  readonly hint: string
  readonly disabled?: boolean
  readonly onClick: () => void
}) {
  const tone =
    side === "left"
      ? "bg-transparent hover:bg-danger/[0.06] active:bg-danger/[0.13]"
      : "bg-transparent hover:bg-success/[0.06] active:bg-success/[0.13]"

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={hint}
      className={`flex h-dvh min-h-dvh min-w-0 flex-1 self-stretch flex-col items-center justify-center gap-2 px-2 text-center transition-colors duration-200 ease-out ${tone} disabled:opacity-25`}
    >
      <span
        className={`text-xl font-light text-foreground/35 ${side === "left" ? "-scale-x-100" : ""}`}
        aria-hidden
      >
        →
      </span>
      <span className="max-w-[6.5rem] text-[10px] font-semibold uppercase leading-tight tracking-wide text-foreground/55">
        {label}
      </span>
    </button>
  )
}