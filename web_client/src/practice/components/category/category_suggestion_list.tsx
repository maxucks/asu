"use client"

import { useAnchoredOverlayPosition } from "@/practice/components/category/use_anchored_overlay_position"
import type { ReactNode } from "react"
import { createPortal } from "react-dom"

type CategorySuggestionListProps = {
  readonly open: boolean
  readonly anchorRef: React.RefObject<HTMLElement | null>
  readonly children: ReactNode
  readonly widthClassName?: string
}

export function CategorySuggestionList({
  open,
  anchorRef,
  children,
  widthClassName = "w-52",
}: CategorySuggestionListProps) {
  const style = useAnchoredOverlayPosition(anchorRef, open)

  if (!open || !style || typeof document === "undefined") return null

  return createPortal(
    <ul
      style={{ top: style.top, left: style.left, width: style.width, maxHeight: style.maxHeight }}
      data-category-suggestions
      className={`scrollbar-hidden fixed z-[90] overflow-y-auto rounded-xl border border-grid-line bg-card py-1 shadow-xl ${widthClassName}`}
    >
      {children}
    </ul>,
    document.body,
  )
}