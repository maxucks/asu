import type { ReactNode } from "react"

type PracticeMainEmptyMessageProps = {
  readonly message: string
  readonly detail?: string
  readonly action?: ReactNode
}

export function PracticeMainEmptyMessage({ message, detail, action }: PracticeMainEmptyMessageProps) {
  return (
    <section className="flex min-h-[min(70vh,32rem)] flex-1 flex-col overflow-hidden rounded-2xl border border-grid-line bg-card shadow-lg">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <p className="text-sm font-medium text-foreground">{message}</p>
        {detail ? <p className="max-w-sm text-sm leading-relaxed text-muted">{detail}</p> : null}
        {action ? <div className="mt-1 flex flex-wrap items-center justify-center gap-2">{action}</div> : null}
      </div>
    </section>
  )
}