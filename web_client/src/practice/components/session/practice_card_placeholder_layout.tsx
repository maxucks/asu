import { assocListGridClassName } from "@/practice/components/assoc/list_layout"
import {
  PRACTICE_PLACEHOLDER_BLOCK_CLASS,
  practiceCardShellClassName,
} from "@/practice/components/session/practice_card_shell"

function PlaceholderBlock({ className }: { readonly className: string }) {
  return <div className={`${PRACTICE_PLACEHOLDER_BLOCK_CLASS} ${className}`} aria-hidden />
}

export function PracticeCardPlaceholderLayout() {
  return (
    <section
      className={practiceCardShellClassName()}
      aria-busy="true"
      aria-label="Loading practice card"
    >
      <div className="shrink-0 space-y-3 px-5 pb-3 pt-5">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <PlaceholderBlock className="h-3 w-14" />
            <PlaceholderBlock className="h-7 w-48 max-w-[85%]" />
            <PlaceholderBlock className="h-4 w-full max-w-sm" />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <PlaceholderBlock className="size-9 rounded-lg" />
            <PlaceholderBlock className="size-9 rounded-lg" />
          </div>
        </header>
      </div>

      <div className="shrink-0 border-b border-grid-line px-5 pb-3">
        <div
          className="flex items-center gap-1 rounded-xl border border-grid-line bg-tile/80 p-1"
          aria-hidden
        >
          <PlaceholderBlock className="h-7 w-[4.5rem] rounded-lg" />
          <PlaceholderBlock className="h-7 w-[4.75rem] rounded-lg" />
        </div>
      </div>

      <div className="shrink-0 space-y-3 border-b border-grid-line px-5 py-5">
        <PlaceholderBlock className="h-[3.25rem] w-full rounded-xl" />
        <div className="flex flex-wrap gap-1.5">
          <PlaceholderBlock className="h-7 w-20 rounded-full" />
          <PlaceholderBlock className="h-7 w-24 rounded-full" />
        </div>
      </div>

      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto">
        <ul className={assocListGridClassName}>
          {[0, 1].map((index) => (
            <li key={index} className="relative min-w-0 bg-card">
              <div className="aspect-square w-full bg-tile" aria-hidden />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}