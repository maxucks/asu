import type { PracticeAssociation } from "@/practice/practice_model"
import { associationKindLabel } from "@/practice/practice_utils"

export function AssocHiddenPeek({
  association,
  onReveal,
  tile,
}: {
  readonly association: PracticeAssociation
  readonly onReveal: () => void
  readonly tile?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onReveal}
      className={
        tile
          ? "flex size-full flex-col items-center justify-center gap-1 bg-tile p-2 text-center text-xs text-muted transition hover:bg-[#242424] hover:text-foreground"
          : "flex w-full items-center justify-between gap-3 rounded-lg border border-dashed border-grid-line bg-tile px-4 py-3 text-left text-sm text-muted transition hover:text-foreground"
      }
    >
      <span className="uppercase tracking-wide text-[10px]">{associationKindLabel(association.kind)}</span>
      <span>{tile ? "Hidden · tap" : "Hidden cue"}</span>
      {!tile ? <span className="shrink-0 text-xs font-medium text-accent">Tap to show</span> : null}
    </button>
  )
}