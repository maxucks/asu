import { ASSOCIATION_ADD_MENU, type AssociationAddAction } from "@/practice/practice_utils"
import { useEffect, useRef, useState } from "react"

export type { AssociationAddAction } from "@/practice/practice_utils"

export function AddMenu({ disabled, onPick }: { readonly disabled?: boolean; readonly onPick: (pick: AssociationAddAction) => void }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative flex aspect-square size-full min-h-0 items-stretch">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="flex size-full flex-col items-center justify-center gap-1 bg-tile text-muted transition hover:bg-[#242424] hover:text-accent disabled:opacity-40"
      >
        <span className="text-3xl font-light leading-none text-accent" aria-hidden>
          +
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wide">Add cue</span>
      </button>
      {open && !disabled ? (
        <ul
          className="absolute bottom-full left-1/2 z-20 mb-1 max-h-dropdown w-56 -translate-x-1/2 overflow-y-auto rounded-lg border border-grid-line bg-card py-1"
          role="menu"
        >
          {ASSOCIATION_ADD_MENU.map((item) => {
            const enabled = item.enabled !== false
            return (
              <li key={item.label} role="none">
                <button
                  type="button"
                  role="menuitem"
                  disabled={!enabled}
                  className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50 enabled:text-foreground enabled:hover:bg-tile"
                  onClick={() => {
                    if (!enabled) return
                    onPick(item.pick)
                    setOpen(false)
                  }}
                >
                  <span>{item.label}</span>
                  {item.hint ? <span className="text-[10px] font-medium uppercase tracking-wide text-muted">{item.hint}</span> : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}