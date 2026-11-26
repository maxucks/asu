"use client"

export type LibraryTab = "cases" | "notes"

type LibraryTabBarProps = {
  readonly tab: LibraryTab
  readonly onTab: (tab: LibraryTab) => void
  readonly casesCount?: number
  readonly notesCount?: number
}

export function LibraryTabBar({ tab, onTab, casesCount, notesCount }: LibraryTabBarProps) {
  const tabClass = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
      active
        ? "bg-accent-soft text-accent ring-1 ring-accent/30"
        : "text-muted hover:bg-tile hover:text-foreground"
    }`

  return (
    <div className="flex items-center gap-1 rounded-xl border border-grid-line bg-tile/80 p-1" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={tab === "cases"}
        className={tabClass(tab === "cases")}
        onClick={() => onTab("cases")}
      >
        Words
        {casesCount !== undefined ? (
          <span className="ml-1.5 tabular-nums text-[10px] font-medium opacity-80">{casesCount}</span>
        ) : null}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={tab === "notes"}
        className={tabClass(tab === "notes")}
        onClick={() => onTab("notes")}
      >
        Notes
        {notesCount !== undefined ? (
          <span className="ml-1.5 tabular-nums text-[10px] font-medium opacity-80">{notesCount}</span>
        ) : null}
      </button>
    </div>
  )
}