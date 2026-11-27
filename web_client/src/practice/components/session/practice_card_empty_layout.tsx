"use client"

import { PracticeMainEmptyMessage } from "@/practice/components/session/practice_main_empty_message"

type PracticeCardEmptyLayoutProps = {
  readonly categoryActive?: boolean
  readonly onClearCategory?: () => void
  readonly detail?: string
}

export function PracticeCardEmptyLayout({
  categoryActive,
  onClearCategory,
  detail: detailOverride,
}: PracticeCardEmptyLayoutProps) {
  const message = categoryActive ? "Nothing to review in this category" : "Nothing to review yet"
  const detail =
    detailOverride ??
    (categoryActive
      ? "This category has no words in your practice queue. Add words from the library, or show all cards."
      : "Add words from the library to start practicing in this language.")

  return (
    <PracticeMainEmptyMessage
      message={message}
      detail={detail}
      action={
        categoryActive && onClearCategory ? (
          <button
            type="button"
            onClick={onClearCategory}
            className="rounded-lg border border-grid-line bg-tile px-3 py-2 text-xs font-medium text-foreground transition hover:border-accent/40"
          >
            Show all cards
          </button>
        ) : null
      }
    />
  )
}