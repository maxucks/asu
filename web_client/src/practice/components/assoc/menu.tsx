import { useEffect, useRef, useState } from "react"

export type AssocMenuAction = "edit" | "hide" | "unhide" | "delete"

export function AssocMenu(props: {
  readonly canEdit?: boolean
  readonly canHide?: boolean
  readonly canUnhide?: boolean
  readonly canDelete?: boolean
  readonly onEdit?: () => void
  readonly onHide?: () => void
  readonly onUnhide?: () => void
  readonly onDelete?: () => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onPointer)
    return () => document.removeEventListener("pointerdown", onPointer)
  }, [open])

  const items = [
    ...(props.canEdit && props.onEdit ? [{ action: "edit" as const, label: "Edit" }] : []),
    ...(props.canHide && props.onHide ? [{ action: "hide" as const, label: "Hide from card" }] : []),
    ...(props.canUnhide && props.onUnhide ? [{ action: "unhide" as const, label: "Show on card" }] : []),
    ...(props.canDelete && props.onDelete ? [{ action: "delete" as const, label: "Delete…", danger: true }] : []),
  ]

  if (items.length === 0) return null

  function pick(action: AssocMenuAction) {
    setOpen(false)
    if (action === "edit") props.onEdit?.()
    if (action === "hide") props.onHide?.()
    if (action === "unhide") props.onUnhide?.()
    if (action === "delete") props.onDelete?.()
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((v) => !v)} className="rounded-md border border-grid-line bg-card/95 px-2 py-1 text-sm font-semibold leading-none text-foreground shadow-sm backdrop-blur-sm transition hover:border-accent/40 hover:text-accent">
        ⋯
      </button>
      {open ? (
        <ul className="absolute right-0 z-20 mt-1 min-w-42 overflow-hidden rounded-lg border border-grid-line bg-card py-1 shadow-xl" role="menu">
          {items.map((item) => (
            <li key={item.action} role="none">
              <button
                type="button"
                role="menuitem"
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-tile ${"danger" in item && item.danger ? "text-danger hover:text-danger" : "text-foreground"}`}
                onClick={() => pick(item.action)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}