/** Outer chrome shared by the practice card, loading placeholder, and empty state. */
export function practiceCardShellClassName(flat?: boolean): string {
  return `flex min-h-[min(70vh,32rem)] flex-1 flex-col overflow-hidden rounded-2xl border border-grid-line bg-card ${
    flat ? "" : "shadow-lg"
  }`
}

/** Static block for loading placeholders — no animation. */
export const PRACTICE_PLACEHOLDER_BLOCK_CLASS = "rounded-lg bg-tile"