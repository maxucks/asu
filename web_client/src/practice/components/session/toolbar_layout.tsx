import type { AssociationAddAction } from "@/practice/practice_utils"
import { AddMenu } from "@/practice/components/session/add_menu"

type ToolbarLayoutProps = {
  readonly onFront: boolean
  readonly editingCase: boolean
  readonly caseSaving: boolean
  readonly showAdd: boolean
  readonly saving: boolean
  readonly onCancelCase: () => void
  readonly onSaveCase: () => void
  readonly onEditCase: () => void
  readonly onDeleteCase: () => void
  readonly onPick: (action: AssociationAddAction) => void
}

export function ToolbarLayout({
  onFront,
  editingCase,
  caseSaving,
  showAdd,
  saving,
  onCancelCase,
  onSaveCase,
  onEditCase,
  onDeleteCase,
  onPick,
}: ToolbarLayoutProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-medium text-slate-200">{onFront ? "What's the word?" : "Answer"}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {onFront ? "Use the associations below, then reveal the answer." : "How well did you remember it?"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {editingCase ? (
          <>
            <button type="button" disabled={caseSaving} onClick={onCancelCase} className="text-sm text-slate-400 hover:text-slate-200">
              Cancel
            </button>
            <button type="button" disabled={caseSaving} onClick={onSaveCase} className="text-sm font-medium text-accent">
              {caseSaving ? "Saving…" : "Save"}
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={onEditCase} className="text-sm text-slate-400 hover:text-slate-200">
              Edit
            </button>
            <button type="button" onClick={onDeleteCase} className="text-sm text-danger hover:brightness-110">
              Delete
            </button>
          </>
        )}
        {showAdd ? <AddMenu disabled={saving} onPick={onPick} /> : null}
      </div>
    </div>
  )
}