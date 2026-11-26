"use client"

import type { RefObject } from "react"
import { useLayoutEffect, useState } from "react"

export type AnchoredOverlayStyle = {
  readonly top: number
  readonly left: number
  readonly width: number
  readonly maxHeight: number
}

export function useAnchoredOverlayPosition(
  anchorRef: RefObject<HTMLElement | null>,
  open: boolean,
  minWidth = 208,
): AnchoredOverlayStyle | null {
  const [style, setStyle] = useState<AnchoredOverlayStyle | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      setStyle(null)
      return
    }

    let rafId = 0

    function measure() {
      const anchor = anchorRef.current
      if (!anchor) {
        rafId = requestAnimationFrame(measure)
        return
      }

      const rect = anchor.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) {
        rafId = requestAnimationFrame(measure)
        return
      }

      const margin = 8
      const desiredWidth = Math.max(minWidth, rect.width)
      const left = Math.min(Math.max(margin, rect.left), window.innerWidth - desiredWidth - margin)

      const spaceBelow = Math.max(0, window.innerHeight - rect.bottom - margin)
      const spaceAbove = Math.max(0, rect.top - margin)
      const preferBelow = spaceBelow >= 120 || spaceBelow >= spaceAbove
      const available = preferBelow ? spaceBelow : spaceAbove
      const maxHeight = Math.min(384, Math.max(96, available - 4))
      const top = preferBelow ? rect.bottom + 4 : Math.max(margin, rect.top - maxHeight - 4)

      setStyle({ top, left, width: desiredWidth, maxHeight })
    }

    measure()
    const anchor = anchorRef.current
    const observer = anchor ? new ResizeObserver(() => measure()) : null
    if (anchor && observer) observer.observe(anchor)

    window.addEventListener("resize", measure)
    window.addEventListener("scroll", measure, true)

    return () => {
      cancelAnimationFrame(rafId)
      observer?.disconnect()
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", measure, true)
    }
  }, [anchorRef, minWidth, open])

  return style
}