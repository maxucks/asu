import type { AssocRow } from "@/practice/components/assoc/list_layout"
import { AssocListLayout } from "@/practice/components/assoc/list_layout"
import type { AssociationAddAction } from "@/practice/practice_utils"
import type { ReactNode } from "react"

/** Shared scroll region: association grid (+ optional slot below, e.g. practice answer reveal). */
export type CaseEntryAssociationsRegionProps = {
  readonly rows: readonly AssocRow[]
  readonly showAdd: boolean
  readonly addMenuDisabled?: boolean
  readonly saving: boolean
  readonly addText: ReactNode
  readonly addUrl: ReactNode
  readonly onPick: (action: AssociationAddAction) => void
  readonly sortable?: boolean
  readonly onReorder?: (associationIds: readonly string[]) => void
  readonly associationTextClassName?: string
  readonly trailing?: ReactNode
}

export function CaseEntryAssociationsRegion({
  rows,
  showAdd,
  addMenuDisabled,
  saving,
  addText,
  addUrl,
  onPick,
  sortable,
  onReorder,
  associationTextClassName,
  trailing,
}: CaseEntryAssociationsRegionProps) {
  return (
    <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto">
      <h2 className="sr-only">Associations</h2>
      <AssocListLayout
        rows={rows}
        showAdd={showAdd}
        addMenuDisabled={addMenuDisabled}
        saving={saving}
        addText={addText}
        addUrl={addUrl}
        onPick={onPick}
        associationTextClassName={associationTextClassName}
        sortable={sortable}
        onReorder={onReorder}
      />
      {trailing}
    </div>
  )
}