"use client"

import {
  canCreateNewFromSearchQuery,
  filterBySubstringSearch,
  findByExactSearchName,
} from "@/core/utils/search_query"
import { CategoryChipRow } from "@/practice/components/category/category_chip_row"
import { CategorySuggestionList } from "@/practice/components/category/category_suggestion_list"
import { IconPlus } from "@/practice/components/session/icon_button"
import type { CategoryDto } from "@/practice/practice_repository"
import type { CaseCategoryRefDto } from "@/core/data_sources/http_case_data_source"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const ADD_CATEGORY_HINT =
  "Tag cases into groups so you can practice one set together from the category filter."

export function CaseCategoryField({
  categories,
  value,
  disabled,
  onCreateCategory,
  onChange,
}: {
  readonly categories: readonly CategoryDto[]
  readonly value: readonly CaseCategoryRefDto[]
  readonly disabled?: boolean
  readonly onCreateCategory: (name: string) => Promise<CategoryDto | null>
  readonly onChange: (categoryIds: readonly string[]) => void
}) {
  const [editing, setEditing] = useState(false)
  const [query, setQuery] = useState("")
  const [listOpen, setListOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pickerAnchorRef = useRef<HTMLDivElement>(null)

  const assignedIds = useMemo(() => new Set(value.map((item) => item.id)), [value])

  const pickable = useMemo(
    () => categories.filter((item) => !assignedIds.has(item.id)),
    [assignedIds, categories],
  )

  const filtered = useMemo(
    () => filterBySubstringSearch(pickable, query, (item) => [item.name]),
    [pickable, query],
  )

  const exactMatch = useMemo(
    () => findByExactSearchName(categories, query, (item) => item.name),
    [categories, query],
  )

  const queryTrim = query.trim()
  const canCreateFromQuery = canCreateNewFromSearchQuery(
    query,
    categories.map((item) => item.name),
  )

  const closePicker = useCallback(() => {
    setListOpen(false)
    setEditing(false)
    setQuery("")
  }, [])

  function startEditing() {
    if (disabled) return
    setEditing(true)
    setListOpen(true)
  }

  useEffect(() => {
    if (!editing) return
    const id = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [editing])

  useEffect(() => {
    if (!editing) return
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      if (target instanceof Element && target.closest("[data-category-suggestions]")) return
      closePicker()
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [closePicker, editing])

  function addCategoryId(id: string) {
    onChange([...value.map((item) => item.id), id])
    setQuery("")
    inputRef.current?.focus()
  }

  function selectCategory(category: CategoryDto) {
    addCategoryId(category.id)
  }

  async function createAndSelect() {
    if (!canCreateFromQuery || creating || disabled) return
    const name = queryTrim
    setCreating(true)
    const created = await onCreateCategory(name)
    setCreating(false)
    if (!created) return
    addCategoryId(created.id)
  }

  function removeCategory(id: string) {
    onChange(value.map((item) => item.id).filter((item) => item !== id))
  }

  const addControl = (
    <div
      ref={pickerAnchorRef}
      className={`relative flex h-8 shrink-0 items-center rounded-lg border border-grid-line transition-[width,background-color] duration-200 ease-out ${
        editing ? "w-64 bg-tile px-2 shadow-sm overflow-visible" : "overflow-hidden bg-transparent px-2 hover:bg-tile"
      }`}
    >
      {!editing ? (
        <button
          type="button"
          disabled={disabled}
          aria-label="Add category"
          title={ADD_CATEGORY_HINT}
          onClick={startEditing}
          className="flex h-8 items-center gap-1 whitespace-nowrap text-xs font-medium text-muted hover:text-foreground disabled:opacity-40"
        >
          <IconPlus />
          <span>Add category</span>
        </button>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled || creating}
          placeholder="Category…"
          onFocus={() => setListOpen(true)}
          onBlur={() => {
            requestAnimationFrame(() => {
              const active = document.activeElement
              if (rootRef.current?.contains(active)) return
              if (active instanceof Element && active.closest("[data-category-suggestions]")) return
              setListOpen(false)
            })
          }}
          onChange={(e) => {
            setQuery(e.target.value)
            setListOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") closePicker()
            if (e.key === "Enter") {
              e.preventDefault()
              const exactPick = findByExactSearchName(pickable, query, (item) => item.name)
              if (exactPick) selectCategory(exactPick)
              else if (canCreateFromQuery) void createAndSelect()
              else if (filtered[0]) selectCategory(filtered[0])
            }
          }}
          className="h-8 min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none disabled:opacity-50"
        />
      )}
    </div>
  )

  const trailingMeasure = (
    <div className="flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-grid-line px-2 text-xs font-medium">
      <IconPlus />
      <span>Add category</span>
    </div>
  )

  return (
    <div ref={rootRef} className="relative z-20 w-full min-w-0 overflow-visible">
      <CategoryChipRow
        items={value}
        expandable
        overflowMode="expand-label"
        onRemove={removeCategory}
        trailing={addControl}
        trailingMeasure={trailingMeasure}
      />
      <CategorySuggestionList open={listOpen && editing} anchorRef={pickerAnchorRef}>
        {filtered.length === 0 && !canCreateFromQuery && query.trim() && exactMatch && assignedIds.has(exactMatch.id) ? (
          <li className="px-3 py-2 text-sm text-muted">Already on this card.</li>
        ) : null}
        {filtered.length === 0 && !canCreateFromQuery && !(query.trim() && exactMatch && assignedIds.has(exactMatch.id)) ? (
          <li className="px-3 py-2 text-sm text-muted">
            {pickable.length === 0 ? "No more categories to add." : "Type to search categories."}
          </li>
        ) : null}
        {filtered.length > 0
          ? filtered.map((category) => (
              <li key={category.id}>
                <button
                  type="button"
                  disabled={disabled}
                  className="flex w-full px-3 py-2 text-left text-sm text-foreground transition hover:bg-tile disabled:opacity-40"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectCategory(category)}
                >
                  {category.name}
                </button>
              </li>
            ))
          : null}
        {canCreateFromQuery ? (
          <li className="border-t border-grid-line">
            <button
              type="button"
              disabled={disabled || creating}
              className="flex w-full px-3 py-2 text-left text-sm text-accent transition hover:bg-tile disabled:opacity-40"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => void createAndSelect()}
            >
              {creating ? "Adding…" : `Add category “${query.trim()}”`}
            </button>
          </li>
        ) : null}
      </CategorySuggestionList>
    </div>
  )
}