import { IconButton, IconCheck, IconClose, IconEdit, IconTrash } from "@/practice/components/session/icon_button"

type ToolbarLayoutProps = {
  readonly variant?: "practice" | "library"
  readonly caseTitle?: string
  readonly onFront: boolean
  readonly editingCase: boolean
  readonly caseSaving: boolean
  readonly onCancelCase: () => void
  readonly onSaveCase: () => void
  readonly onEditCase: () => void
  readonly onDeleteCase: () => void
}

export function ToolbarLayout({
  variant = "practice",
  caseTitle,
  onFront,
  editingCase,
  caseSaving,
  onCancelCase,
  onSaveCase,
  onEditCase,
  onDeleteCase,
}: ToolbarLayoutProps) {
  const library = variant === "library"

  return (
    <header className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          {library ? "Case" : onFront ? "Recall" : "Review"}
        </p>
        {library ? (
          <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground">{caseTitle ?? "—"}</h1>
        ) : (
          <>
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground">
              {onFront ? "What's the word?" : "How did you do?"}
            </h1>
            <p className="text-sm leading-relaxed text-muted">
              {onFront ? "Study the cues in the grid, then reveal the answer." : "Rate how well you remembered it."}
            </p>
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {editingCase ? (
          <>
            <IconButton label="Cancel editing" onClick={onCancelCase} disabled={caseSaving}>
              <IconClose />
            </IconButton>
            <IconButton label="Save entry" tone="accent" onClick={onSaveCase} disabled={caseSaving}>
              <IconCheck />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton label="Edit entry" onClick={onEditCase}>
              <IconEdit />
            </IconButton>
            <IconButton label="Delete entry" tone="danger" onClick={onDeleteCase}>
              <IconTrash />
            </IconButton>
          </>
        )}
      </div>
    </header>
  )
}