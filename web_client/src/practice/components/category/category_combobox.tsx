"use client"

import {
  filterBySubstringSearch,
  findByExactSearchName,
} from "@/core/utils/search_query"
import { categoryChipClassName } from "@/practice/components/category/category_chip"
import type { CategoryDto } from "@/practice/practice_repository"
import { useEffect, useMemo, useRef, useState } from "react"

export function CategoryCombobox({
  categories,
  selectedIds,
  disabled,
  onChange,
  onCreate,
}: {
  readonly categories: readonly CategoryDto[]
  readonly selectedIds: readonly string[]
  readonly disabled?: boolean
  readonly onChange: (nextIds: readonly string[]) => void
  readonly onCreate: (name: string) => Promise<CategoryDto | null>
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(
    () => categories.filter((item) => selectedIds.includes(item.id)),
    [categories, selectedIds],
  )

  const filtered = useMemo(
    () => filterBySubstringSearch(categories, query, (item) => [item.name]),
    [categories, query],
  )

  const exactMatch = useMemo(
    () => findByExactSearchName(categories, query, (item) => item.name),
    [categories, query],
  )

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [open])

  function toggleCategory(id: string) {
    if (selectedIds.includes(id)) onChange(selectedIds.filter((item) => item !== id))
    else onChange([...selectedIds, id])
  }

  async function createFromQuery() {
    const name = query.trim()
    if (name.length === 0) return
    const created = await onCreate(name)
    if (!created) return
    if (!selectedIds.includes(created.id)) onChange([...selectedIds, created.id])
    setQuery("")
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative flex min-w-0 flex-wrap items-center gap-1.5">
      {selected.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={disabled}
          title="Remove category"
          onClick={() => toggleCategory(item.id)}
          className={`${categoryChipClassName()} transition hover:border-foreground/25 hover:bg-foreground/5 disabled:opacity-40`}
        >
          {item.name} <span className="text-muted">×</span>
        </button>
      ))}
      <div className="relative min-w-[8rem] flex-1">
        <input
          type="text"
          value={query}
          disabled={disabled}
          placeholder="Add category…"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              if (exactMatch) toggleCategory(exactMatch.id)
              else void createFromQuery()
            }
            if (e.key === "Escape") setOpen(false)
          }}
          className="w-full min-w-0 rounded-lg border border-grid-line bg-tile px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted focus:border-accent/40 focus:outline-none disabled:opacity-50"
        />
        {open ? (
          <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-dropdown overflow-y-auto rounded-lg border border-grid-line bg-card py-1 shadow-xl">
            {filtered.map((item) => {
              const active = selectedIds.includes(item.id)
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-tile ${active ? "text-accent" : "text-foreground"}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => toggleCategory(item.id)}
                  >
                    <span>{item.name}</span>
                    {active ? <span className="text-xs text-muted">Selected</span> : null}
                  </button>
                </li>
              )
            })}
            {query.trim().length > 0 && !exactMatch ? (
              <li className="border-t border-grid-line">
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-accent hover:bg-tile"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void createFromQuery()}
                >
                  Create “{query.trim()}”
                </button>
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </div>
  )
}