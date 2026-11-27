"use client"

export type CaseLibraryDetailTab = "entry" | "notes"

type CaseLibraryDetailTabBarProps = {
  readonly tab: CaseLibraryDetailTab
  readonly onTab: (tab: CaseLibraryDetailTab) => void
  readonly notesCount?: number
}

export function CaseLibraryDetailTabBar({ tab, onTab, notesCount }: CaseLibraryDetailTabBarProps) {
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
        aria-selected={tab === "entry"}
        className={tabClass(tab === "entry")}
        onClick={() => onTab("entry")}
      >
        Entry
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