"use client"

import { AddMenuItemIcon } from "@/practice/components/session/add_menu_icons"
import { ASSOCIATION_ADD_MENU, type AssociationAddAction } from "@/practice/practice_utils"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

export type { AssociationAddAction } from "@/practice/practice_utils"

const PANEL_WIDTH = 268
const MIN_SPACE = 200

type MenuPlacement = {
  readonly top: number
  readonly left: number
  readonly maxHeight: number
  readonly opensAbove: boolean
}

export function AddMenu({ disabled, onPick }: { readonly disabled?: boolean; readonly onPick: (pick: AssociationAddAction) => void }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLButtonElement>(null)
  const [placement, setPlacement] = useState<MenuPlacement | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      setPlacement(null)
      return
    }

    function position() {
      const anchor = anchorRef.current
      if (!anchor) return

      const rect = anchor.getBoundingClientRect()
      const margin = 8
      const gap = 6
      const left = Math.min(
        Math.max(margin, rect.left + rect.width / 2 - PANEL_WIDTH / 2),
        window.innerWidth - PANEL_WIDTH - margin,
      )

      const spaceBelow = window.innerHeight - rect.bottom - margin
      const spaceAbove = rect.top - margin
      const opensAbove = spaceBelow < MIN_SPACE && spaceAbove >= spaceBelow
      const maxHeight = Math.min(384, Math.max(140, opensAbove ? spaceAbove - gap : spaceBelow - gap))
      const top = opensAbove ? rect.top - gap : rect.bottom + gap

      setPlacement({ top, left, maxHeight, opensAbove })
    }

    position()
    window.addEventListener("resize", position)
    window.addEventListener("scroll", position, true)
    return () => {
      window.removeEventListener("resize", position)
      window.removeEventListener("scroll", position, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      if (target instanceof Element && target.closest("[data-add-association-menu]")) return
      setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    window.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative flex aspect-square size-full min-h-0 items-stretch">
      <button
        ref={anchorRef}
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
      {open && !disabled && placement && typeof document !== "undefined"
        ? createPortal(
            <div
              data-add-association-menu
              role="menu"
              style={{
                top: placement.top,
                left: placement.left,
                width: PANEL_WIDTH,
                maxHeight: placement.maxHeight,
                transform: placement.opensAbove ? "translateY(-100%)" : undefined,
              }}
              className="fixed z-[90]"
            >
              <div
                className={`scrollbar-hidden flex max-h-[inherit] gap-1.5 overflow-y-auto rounded-xl border border-grid-line bg-card p-2 shadow-2xl ${
                  placement.opensAbove ? "animate-add-menu-up flex-col-reverse" : "animate-add-menu-down flex-col"
                }`}
              >
                {ASSOCIATION_ADD_MENU.map((item) => {
                  const enabled = item.enabled !== false
                  return (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      disabled={!enabled}
                      className="flex w-full items-center gap-2.5 rounded-lg border border-grid-line bg-tile px-2 py-2 text-left transition enabled:hover:border-foreground/20 enabled:hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-45"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        if (!enabled) return
                        onPick(item.pick)
                        setOpen(false)
                      }}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-grid-line bg-background">
                        <AddMenuItemIcon item={item} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground">{item.label}</span>
                        {item.hint ? (
                          <span className="block text-[10px] font-medium uppercase tracking-wide text-muted">{item.hint}</span>
                        ) : null}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}