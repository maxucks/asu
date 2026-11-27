"use client"

import { uiToolbarControlClassName } from "@/core/components/ui_kit/control_styles"
import { mergeClassNames } from "@/core/utils/merge_class_names"
import type { CategoryDto } from "@/practice/practice_repository"
import { useEffect, useRef, useState } from "react"

type LibraryCategoryFilterProps = {
  readonly categories: readonly CategoryDto[]
  readonly activeCategoryId: string | null
  readonly onActiveCategoryId: (categoryId: string | null) => void
}

export function LibraryCategoryFilter({
  categories,
  activeCategoryId,
  onActiveCategoryId,
}: LibraryCategoryFilterProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const active = categories.find((item) => item.id === activeCategoryId) ?? null
  const label = active?.name ?? "All categories"

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
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

  if (categories.length === 0) return null

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
        className={mergeClassNames(
          uiToolbarControlClassName,
          "flex max-w-[9.5rem] items-center gap-1 px-2.5 text-left hover:border-accent/40",
          activeCategoryId ? "border-foreground/35" : undefined,
        )}
      >
        <span className="min-w-0 truncate text-xs font-medium text-foreground">{label}</span>
        <span className="shrink-0 text-[10px] text-muted">▼</span>
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-30 mt-1 max-h-dropdown w-52 overflow-y-auto rounded-lg border border-grid-line bg-card py-1 shadow-xl"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={activeCategoryId === null}
              className={`flex w-full px-3 py-2 text-left text-sm transition hover:bg-tile ${
                activeCategoryId === null ? "text-accent" : "text-foreground"
              }`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onActiveCategoryId(null)
                setOpen(false)
              }}
            >
              All categories
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                role="option"
                aria-selected={activeCategoryId === category.id}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition hover:bg-tile ${
                  activeCategoryId === category.id ? "text-accent" : "text-foreground"
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onActiveCategoryId(category.id)
                  setOpen(false)
                }}
              >
                <span className="min-w-0 truncate">{category.name}</span>
                <span className="shrink-0 tabular-nums text-[10px] text-muted">{category.caseCount}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}