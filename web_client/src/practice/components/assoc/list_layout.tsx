import type { AssocFlags } from "@/practice/assoc_flags"
import type { PracticeAssociation } from "@/practice/practice_model"
import { AssocCardLayout } from "@/practice/components/assoc/card_layout"
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

export function AssocListLayout({ rows }: { readonly rows: readonly AssocRow[] }) {
  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        if (row.flags.editing && row.flags.compose === "text") {
          return <li key={row.association.id}>{row.textEdit}</li>
        }
        if (row.flags.editing && row.flags.compose === "image_url") {
          return <li key={row.association.id}>{row.urlEdit}</li>
        }
        return (
          <li key={row.association.id}>
            <AssocCardLayout
              association={row.association}
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
    </ul>
  )
}