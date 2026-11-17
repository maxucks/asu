"use client"

import type { CategoryDto } from "@/practice/practice_repository"
import { useEffect } from "react"

export function CategoryFilterModal({
  open,
  categories,
  activeCategoryId,
  totalInLanguage,
  loading,
  onClose,
  onSelect,
  onClear,
}: {
  readonly open: boolean
  readonly categories: readonly CategoryDto[]
  readonly activeCategoryId: string | null
  readonly totalInLanguage: number
  readonly loading?: boolean
  readonly onClose: () => void
  readonly onSelect: (categoryId: string) => void
  readonly onClear: () => void
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation" onClick={onClose}>
      <div
        className="flex max-h-[min(28rem,85dvh)] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-grid-line bg-card shadow-2xl"
        role="dialog"
        aria-label="Category filter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-grid-line px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">Practice category</h2>
          <p className="mt-1 text-sm text-muted">Only cards in the selected category are shown.</p>
        </div>
        <ul className="scrollbar-hidden flex-1 overflow-y-auto divide-y divide-grid-line">
          {loading ? (
            <li className="px-5 py-6 text-sm text-muted">Loading…</li>
          ) : (
            <>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onClear()
                    onClose()
                  }}
                  className={`flex w-full items-center justify-between px-5 py-3 text-left text-sm transition hover:bg-tile ${
                    activeCategoryId === null ? "bg-tile text-foreground" : "text-foreground"
                  }`}
                >
                  <span>All cards</span>
                  <span className="tabular-nums text-muted">{totalInLanguage}</span>
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(category.id)
                      onClose()
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-5 py-3 text-left text-sm transition hover:bg-tile ${
                      activeCategoryId === category.id ? "bg-tile ring-1 ring-inset ring-foreground/15" : ""
                    }`}
                  >
                    <span className="min-w-0 truncate font-medium text-foreground">{category.name}</span>
                    <span className="shrink-0 tabular-nums text-muted">{category.caseCount}</span>
                  </button>
                </li>
              ))}
            </>
          )}
        </ul>
        {activeCategoryId ? (
          <div className="border-t border-grid-line px-5 py-3">
            <button
              type="button"
              onClick={() => {
                onClear()
                onClose()
              }}
              className="w-full rounded-lg border border-grid-line px-3 py-2 text-sm font-medium text-foreground transition hover:border-accent/40 hover:bg-tile"
            >
              Clear category filter
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}