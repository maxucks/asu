import { AssociationTileColorGrid } from "@/practice/components/assoc/association_tile_color_grid"
import { associationTileColorHex, type AssociationTileColorId } from "@/practice/association_tile_colors"
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react"
import { createPortal } from "react-dom"

const PANEL_WIDTH = 112
const PANEL_HEIGHT = 112
const VIEWPORT_MARGIN = 8

type AnchorPosition = {
  readonly top: number
  readonly left: number
}

function useAnchorPosition(
  anchorRef: RefObject<HTMLElement | null>,
  active: boolean,
): AnchorPosition | null {
  const [position, setPosition] = useState<AnchorPosition | null>(null)

  useLayoutEffect(() => {
    if (!active) {
      setPosition(null)
      return
    }

    function update() {
      const anchor = anchorRef.current
      if (!anchor) return

      const rect = anchor.getBoundingClientRect()
      const gap = 4
      const spaceBelow = window.innerHeight - rect.bottom
      const openAbove = spaceBelow < PANEL_HEIGHT + gap && rect.top > PANEL_HEIGHT + gap

      const top = openAbove ? rect.top - PANEL_HEIGHT - gap : rect.bottom + gap
      let left = rect.left
      left = Math.max(VIEWPORT_MARGIN, Math.min(left, window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN))

      setPosition({ top, left })
    }

    update()
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [active, anchorRef])

  return position
}

export function AssociationTileColorPop({
  anchorRef,
  value,
  onPick,
  onClose,
}: {
  readonly anchorRef: RefObject<HTMLElement | null>
  readonly value: AssociationTileColorId
  readonly onPick: (id: AssociationTileColorId) => void
  readonly onClose: () => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const position = useAnchorPosition(anchorRef, true)

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const root = rootRef.current
      const anchor = anchorRef.current
      const target = event.target as Node
      if (root?.contains(target) || anchor?.contains(target)) return
      onClose()
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", onPointerDown)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [anchorRef, onClose])

  if (position === null || typeof document === "undefined") return null

  const panel = (
    <div
      ref={rootRef}
      className="fixed z-[60] rounded-lg border border-grid-line bg-card p-2 shadow-2xl"
      style={{ top: position.top, left: position.left, width: PANEL_WIDTH, height: PANEL_HEIGHT }}
      role="dialog"
      aria-label="Tile color"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <AssociationTileColorGrid
        value={value}
        onPick={(id) => {
          onPick(id)
          onClose()
        }}
      />
    </div>
  )

  return createPortal(panel, document.body)
}

export function associationTileColorSwatchStyle(id: AssociationTileColorId): { backgroundColor: string } {
  return { backgroundColor: associationTileColorHex(id) }
}