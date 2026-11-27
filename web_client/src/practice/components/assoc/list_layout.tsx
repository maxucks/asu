"use client"

import type { AssocFlags } from "@/practice/assoc_flags"
import type { PracticeAssociation } from "@/practice/practice_model"
import { AddMenu } from "@/practice/components/session/add_menu"
import { AssocCardLayout } from "@/practice/components/assoc/card_layout"
import type { AssociationAddAction } from "@/practice/practice_utils"
import { reorderAssociationIds } from "@/practice/practice_utils"
import type { ReactNode } from "react"
import { useCallback, useState } from "react"

/** Shared with loading placeholders and library preview tiles. */
export const assocListGridClassName = "grid grid-cols-2 gap-px bg-grid-line"

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
  readonly sortable?: boolean
}

type AssocListLayoutProps = {
  readonly rows: readonly AssocRow[]
  readonly showAdd: boolean
  /** When true, the add cell stays visible but cannot be opened (e.g. review step on an empty card). */
  readonly addMenuDisabled?: boolean
  readonly saving: boolean
  readonly addText: ReactNode
  readonly addUrl: ReactNode
  readonly onPick: (action: AssociationAddAction) => void
  readonly associationTextClassName?: string
  readonly sortable?: boolean
  readonly onReorder?: (associationIds: readonly string[]) => void
}

export function AssocListLayout({
  rows,
  showAdd,
  addMenuDisabled = false,
  saving,
  addText,
  addUrl,
  onPick,
  associationTextClassName,
  sortable = false,
  onReorder,
}: AssocListLayoutProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const canSort = sortable && !saving && onReorder !== undefined

  const sortableIds = rows.filter((row) => row.sortable !== false && !row.flags.editing).map((row) => row.association.id)

  const commitReorder = useCallback(
    (activeId: string, overId: string) => {
      if (!onReorder) return
      const next = reorderAssociationIds(sortableIds, activeId, overId)
      if (next) onReorder(next)
    },
    [onReorder, sortableIds],
  )

  return (
    <ul className={assocListGridClassName}>
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

        const rowSortable = canSort && row.sortable !== false
        const isDragging = draggingId === row.association.id
        const isOver = dragOverId === row.association.id && draggingId !== row.association.id

        return (
          <li
            key={row.association.id}
            className={`relative min-w-0 bg-card transition ${isDragging ? "opacity-45" : ""} ${isOver ? "z-[1] ring-2 ring-inset ring-accent" : ""}`}
            draggable={rowSortable}
            onDragStart={(event) => {
              if (!rowSortable) return
              setDraggingId(row.association.id)
              event.dataTransfer.effectAllowed = "move"
              event.dataTransfer.setData("text/plain", row.association.id)
            }}
            onDragEnd={() => {
              setDraggingId(null)
              setDragOverId(null)
            }}
            onDragOver={(event) => {
              if (!rowSortable || draggingId === null) return
              event.preventDefault()
              event.dataTransfer.dropEffect = "move"
              setDragOverId(row.association.id)
            }}
            onDragLeave={() => {
              if (dragOverId === row.association.id) setDragOverId(null)
            }}
            onDrop={(event) => {
              event.preventDefault()
              const activeId = draggingId ?? event.dataTransfer.getData("text/plain")
              setDraggingId(null)
              setDragOverId(null)
              if (!activeId || activeId === row.association.id) return
              commitReorder(activeId, row.association.id)
            }}
          >
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
          <AddMenu disabled={saving || addMenuDisabled} onPick={onPick} />
        </li>
      ) : null}
    </ul>
  )
}