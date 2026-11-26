"use client"

import { useAnchoredOverlayPosition } from "@/practice/components/category/use_anchored_overlay_position"
import type { ReactNode } from "react"
import { createPortal } from "react-dom"

type AnchoredPopupPanelProps = {
  readonly open: boolean
  readonly anchorRef: React.RefObject<HTMLElement | null>
  readonly children: ReactNode
  readonly widthClassName?: string
  readonly dataAttribute?: string
  readonly bare?: boolean
}

export function AnchoredPopupPanel({
  open,
  anchorRef,
  children,
  widthClassName = "w-56",
  dataAttribute = "data-anchored-popup",
  bare = false,
}: AnchoredPopupPanelProps) {
  const style = useAnchoredOverlayPosition(anchorRef, open, 256)

  if (!open || !style || typeof document === "undefined") return null

  return createPortal(
    <div
      style={{ top: style.top, left: style.left, width: style.width, maxHeight: style.maxHeight }}
      {...{ [dataAttribute]: "" }}
      className={
        bare
          ? `fixed z-[80] flex flex-col gap-2 ${widthClassName}`
          : `scrollbar-hidden fixed z-[80] overflow-y-auto rounded-xl border border-grid-line bg-card p-3 shadow-xl ${widthClassName}`
      }
    >
      {children}
    </div>,
    document.body,
  )
}