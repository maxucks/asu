"use client"

import type { ReactNode } from "react"
import { useLayoutEffect, useState } from "react"
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
  const [style, setStyle] = useState<{
    readonly top: number
    readonly left: number
    readonly width: number
    readonly maxHeight: number
  } | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      setStyle(null)
      return
    }

    function position() {
      const anchor = anchorRef.current
      if (!anchor) return

      const rect = anchor.getBoundingClientRect()
      const margin = 8
      const desiredWidth = Math.max(208, rect.width)
      const left = Math.min(Math.max(margin, rect.left), window.innerWidth - desiredWidth - margin)

      const spaceBelow = window.innerHeight - rect.bottom - margin
      const spaceAbove = rect.top - margin
      const preferBelow = spaceBelow >= 160 || spaceBelow >= spaceAbove
      const maxHeight = Math.min(384, Math.max(120, preferBelow ? spaceBelow : spaceAbove))
      const top = preferBelow ? rect.bottom + 4 : Math.max(margin, rect.top - maxHeight - 4)

      setStyle({ top, left, width: desiredWidth, maxHeight })
    }

    position()
    window.addEventListener("resize", position)
    window.addEventListener("scroll", position, true)
    return () => {
      window.removeEventListener("resize", position)
      window.removeEventListener("scroll", position, true)
    }
  }, [anchorRef, open])

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