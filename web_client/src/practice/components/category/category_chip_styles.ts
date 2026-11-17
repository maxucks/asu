export type CategoryChipSize = "default" | "compact"

export function categoryChipClassName(size: CategoryChipSize = "default"): string {
  return size === "compact"
    ? "inline-flex h-6 max-w-full items-center rounded-md border border-grid-line bg-tile px-1.5 text-[10px] font-medium leading-none text-foreground/90"
    : "inline-flex h-8 max-w-full items-center rounded-lg border border-grid-line bg-tile px-2 text-xs font-medium leading-none text-foreground/90"
}

export const categoryAddButtonClassName =
  "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-grid-line text-muted transition hover:border-foreground/25 hover:bg-tile hover:text-foreground disabled:opacity-40"