import type { CaseRepresentationDto } from "@/core/data_sources/http_case_data_source"
import {
  formatRepresentationTypeLabel,
  nonEmptyCaseRepresentations,
} from "@/practice/practice_representation"

type CaseValueRevealLayoutProps = {
  /** Primary case value (accent variant). */
  readonly value?: string
  readonly representations?: readonly CaseRepresentationDto[]
  readonly variant?: "accent" | "inline"
}

export function CaseValueRevealLayout({
  value,
  representations,
  variant = "accent",
}: CaseValueRevealLayoutProps) {
  const rows = nonEmptyCaseRepresentations(representations)

  if (variant === "accent") {
    return (
      <div className="space-y-3">
        {value ? (
          <p className="text-2xl font-semibold tracking-tight text-accent">{value}</p>
        ) : null}
        {rows.length > 0 ? (
          <ul className="space-y-1.5 border-t border-grid-line/80 pt-3">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">
                  {formatRepresentationTypeLabel(row.representationTypeName)}
                </span>
                <span className="font-medium text-foreground/90">{row.value}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  }

  if (rows.length === 0) return null

  return (
    <ul className="space-y-1.5 rounded-xl border border-grid-line bg-tile/60 px-4 py-3">
      {rows.map((row) => (
        <li key={row.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            {formatRepresentationTypeLabel(row.representationTypeName)}
          </span>
          <span className="font-medium text-foreground">{row.value}</span>
        </li>
      ))}
    </ul>
  )
}