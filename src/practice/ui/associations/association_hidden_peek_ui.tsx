import { associationKindLabel } from "@/practice/practice_association"
import type { PracticeAssociation } from "@/practice/practice_model"

type AssociationHiddenPeekUiProps = {
  readonly association: PracticeAssociation
  readonly onReveal: () => void
}

export function AssociationHiddenPeekUi({ association, onReveal }: AssociationHiddenPeekUiProps) {
  return (
    <button
      type="button"
      onClick={onReveal}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-dashed border-slate-600 bg-slate-900/60 px-4 py-3 text-left text-sm text-slate-400 transition hover:border-slate-500 hover:bg-slate-900 hover:text-slate-200"
    >
      <span>
        <span className="uppercase tracking-wide text-xs text-slate-500">{associationKindLabel(association.kind)}</span>
        <span className="mx-2 text-slate-600">·</span>
        <span>Hidden cue</span>
      </span>
      <span className="shrink-0 text-xs font-medium text-accent">Tap to show</span>
    </button>
  )
}
