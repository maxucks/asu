import type { AssocFlags } from "@/practice/assoc_flags"
import type { PracticeAssociation } from "@/practice/practice_model"
import { AddMenu } from "@/practice/components/session/add_menu"
import { AssocCardLayout } from "@/practice/components/assoc/card_layout"
import type { AssociationAddAction } from "@/practice/practice_utils"
import type { ReactNode } from "react"

export type AssocRow = {
  readonly association: PracticeAssociation
  readonly flags: AssocFlags
  readonly textEdit: ReactNode
  readonly urlEdit: ReactNode
  readonly onEdit: () => void
  readonly onHide: () => void
  readonly onUnhide: () => void
  readonly onDelete: () => void
  readonly onReveal: () => void
}

type AssocListLayoutProps = {
  readonly rows: readonly AssocRow[]
  readonly showAdd: boolean
  readonly saving: boolean
  readonly addText: ReactNode
  readonly addUrl: ReactNode
  readonly onPick: (action: AssociationAddAction) => void
  readonly associationTextClassName?: string
}

export function AssocListLayout({
  rows,
  showAdd,
  saving,
  addText,
  addUrl,
  onPick,
  associationTextClassName,
}: AssocListLayoutProps) {
  return (
    <ul className="grid grid-cols-2 gap-px bg-grid-line">
      {rows.map((row) => {
        if (row.flags.editing && row.flags.compose === "text") {
          return (
            <li key={row.association.id} className="col-span-2 bg-card">
              {row.textEdit}
            </li>
          )
        }
        if (row.flags.editing && row.flags.compose === "image_url") {
          return (
            <li key={row.association.id} className="col-span-2 bg-card">
              {row.urlEdit}
            </li>
          )
        }
        return (
          <li key={row.association.id} className="min-w-0 bg-card">
            <AssocCardLayout
              association={row.association}
              textClassName={associationTextClassName}
              visible={row.flags.visible}
              canEdit={row.flags.canEdit}
              canHide={row.flags.canHide}
              canUnhide={row.flags.canUnhide}
              canDelete={row.flags.canDelete}
              onEdit={row.onEdit}
              onHide={row.onHide}
              onUnhide={row.onUnhide}
              onDelete={row.onDelete}
              onReveal={row.onReveal}
            />
          </li>
        )
      })}
      {addText ? <li className="col-span-2 bg-card">{addText}</li> : null}
      {addUrl ? <li className="col-span-2 bg-card">{addUrl}</li> : null}
      {showAdd ? (
        <li className="min-w-0 bg-card">
          <AddMenu disabled={saving} onPick={onPick} />
        </li>
      ) : null}
    </ul>
  )
}