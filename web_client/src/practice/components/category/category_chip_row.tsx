"use client"

import { categoryChipClassName, type CategoryChipSize } from "@/practice/components/category/category_chip_styles"
import type { ReactNode } from "react"
import { useLayoutEffect, useMemo, useRef, useState } from "react"

export type CategoryChipItem = {
  readonly id: string
  readonly name: string
}

const ROW_GAP_PX = 6
const MORE_LABEL_MIN_PX = 52

type CategoryChipRowProps = {
  readonly items: readonly CategoryChipItem[]
  readonly size?: CategoryChipSize
  readonly expandable?: boolean
  readonly overflowMode?: "expand-label" | "count-chip"
  readonly onRemove?: (id: string) => void
  readonly trailing?: ReactNode
  readonly trailingMeasure?: ReactNode
  readonly emptyLabel?: string
}

export function CategoryChipRow({
  items,
  size = "default",
  expandable = false,
  overflowMode = "expand-label",
  onRemove,
  trailing,
  trailingMeasure,
  emptyLabel,
}: CategoryChipRowProps) {
  const chipClass = categoryChipClassName(size)
  const [expanded, setExpanded] = useState(false)
  const [visibleCount, setVisibleCount] = useState(items.length)
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const trailingMeasureRef = useRef<HTMLDivElement>(null)
  const overflowMeasureRef = useRef<HTMLSpanElement>(null)

  const hiddenCount = Math.max(0, items.length - visibleCount)

  const visibleItems = useMemo(() => {
    if (expandable && expanded) return items
    return items.slice(0, visibleCount)
  }, [expandable, expanded, items, visibleCount])

  useLayoutEffect(() => {
    const container = containerRef.current
    const measure = measureRef.current
    if (!container || !measure) return

    function remeasure() {
      const measureEl = measureRef.current
      const containerEl = containerRef.current
      if (!measureEl || !containerEl) return

      if (expanded) {
        setVisibleCount(items.length)
        return
      }

      const measureChips = [...measureEl.querySelectorAll<HTMLElement>("[data-category-chip]")]
      const chipWidths = measureChips.map((node) => node.offsetWidth)
      const trailingW = trailingMeasureRef.current?.offsetWidth ?? 0
      const containerW = containerEl.clientWidth

      let fit = items.length
      for (let n = items.length; n >= 0; n -= 1) {
        const overflow = items.length - n
        const chipsW = chipWidths.slice(0, n).reduce((sum, width) => sum + width, 0) + Math.max(0, n - 1) * ROW_GAP_PX
        const measuredOverflow = overflowMeasureRef.current?.offsetWidth ?? MORE_LABEL_MIN_PX
        const moreW = overflow > 0 ? measuredOverflow + ROW_GAP_PX : 0
        const trailingGap = trailingW > 0 ? ROW_GAP_PX : 0
        if (chipsW + moreW + trailingW + trailingGap <= containerW) {
          fit = n
          break
        }
      }

      setVisibleCount(fit)
    }

    remeasure()
    const observer = new ResizeObserver(() => remeasure())
    observer.observe(container)
    return () => observer.disconnect()
  }, [expanded, items, trailing, trailingMeasure])

  const showEmpty = items.length === 0 && emptyLabel && !trailing

  return (
    <div className="relative w-full min-w-0">
      <div ref={containerRef} className="flex w-full min-w-0 items-center gap-1.5">
        {showEmpty ? <span className="min-h-8 content-center text-xs text-muted">{emptyLabel}</span> : null}
        <div
          className={`flex min-w-0 flex-1 items-center gap-1.5 ${
            expandable && expanded ? "flex-wrap" : "flex-nowrap overflow-hidden"
          }`}
        >
          {visibleItems.map((item) =>
            onRemove ? (
              <button
                key={item.id}
                type="button"
                data-category-chip
                title="Remove from this card"
                onClick={() => onRemove(item.id)}
                className={`${chipClass} max-w-[12rem] transition hover:border-foreground/25 hover:bg-foreground/5`}
              >
                <span className="truncate">{item.name}</span>
                <span className="ml-1 shrink-0 text-muted">×</span>
              </button>
            ) : (
              <span key={item.id} data-category-chip className={`${chipClass} max-w-[5rem] truncate`}>
                {item.name}
              </span>
            ),
          )}
          {!expanded && expandable && hiddenCount > 0 && overflowMode === "expand-label" ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className={`${chipClass} shrink-0 text-muted hover:border-foreground/25 hover:text-foreground`}
            >
              {hiddenCount} more
            </button>
          ) : null}
          {!expandable && hiddenCount > 0 && overflowMode === "count-chip" ? (
            <span className={`${chipClass} shrink-0 tabular-nums text-muted`}>+{hiddenCount}</span>
          ) : null}
          {!expandable && hiddenCount > 0 && overflowMode === "expand-label" ? (
            <span className={`${size === "compact" ? "text-[10px]" : "text-xs"} shrink-0 self-center text-muted`}>
              {hiddenCount} more
            </span>
          ) : null}
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>

      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none absolute -left-[9999px] top-0 flex gap-1.5 opacity-0"
      >
        {items.map((item) => (
          <span key={item.id} data-category-chip className={`${chipClass} max-w-[12rem]`}>
            {onRemove ? (
              <>
                <span>{item.name}</span>
                <span className="ml-1">×</span>
              </>
            ) : (
              item.name
            )}
          </span>
        ))}
      </div>
      {trailing || trailingMeasure ? (
        <div ref={trailingMeasureRef} aria-hidden className="pointer-events-none absolute -left-[9999px] top-0 opacity-0">
          {trailingMeasure ?? trailing}
        </div>
      ) : null}
      <span
        ref={overflowMeasureRef}
        aria-hidden
        className={`pointer-events-none absolute -left-[9999px] top-0 opacity-0 ${chipClass}`}
      >
        +{Math.max(hiddenCount, items.length)}
      </span>
    </div>
  )
}