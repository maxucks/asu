"use client"

import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import type { PracticeCard } from "@/practice/practice_model"
import {
  caseSupportsTypingTarget,
  typingTargetFromRepresentationType,
  typingTargetLabel,
  type TypingInputTarget,
} from "@/practice/practice_typing_targets"
import { useEffect, useMemo, useState } from "react"

type TypingTargetPickerProps = {
  readonly typingTarget: TypingInputTarget
  readonly onTypingTarget: (target: TypingInputTarget) => void
  readonly representationTypes: readonly RepresentationTypeDto[]
  readonly eligibleCards: readonly PracticeCard[]
  readonly disabled?: boolean
  /** Embedded in the mode pill — no nested field chrome. */
  readonly inline?: boolean
}

export function TypingTargetPicker({
  typingTarget,
  onTypingTarget,
  representationTypes,
  eligibleCards,
  disabled,
  inline = false,
}: TypingTargetPickerProps) {
  const [open, setOpen] = useState(false)

  const targetOptions = useMemo(() => {
    const options: { target: TypingInputTarget; count: number }[] = [
      {
        target: { kind: "original" },
        count: eligibleCards.filter((card) => caseSupportsTypingTarget(card, { kind: "original" })).length,
      },
      ...representationTypes.map((type) => {
        const target = typingTargetFromRepresentationType(type)
        return {
          target,
          count: eligibleCards.filter((card) => caseSupportsTypingTarget(card, target)).length,
        }
      }),
    ]
    return options
  }, [eligibleCards, representationTypes])

  const activeCount =
    targetOptions.find((option) => targetsEqual(option.target, typingTarget))?.count ?? 0

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <div className="relative min-w-0 flex-1">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
        className={
          inline
            ? "flex h-9 w-full min-w-0 items-center gap-1.5 rounded-full px-1.5 text-left text-xs font-medium text-foreground transition hover:bg-tile/60 disabled:cursor-not-allowed disabled:opacity-50"
            : "flex h-9 w-full min-w-0 items-center gap-1 rounded-lg border border-grid-line bg-tile px-2.5 text-left text-xs font-medium text-foreground transition hover:border-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        <span className="min-w-0 flex-1 truncate">
          {typingTargetLabel(typingTarget, representationTypes)}
        </span>
        <span className="shrink-0 tabular-nums text-[10px] text-muted">{activeCount}</span>
        <span className="shrink-0 text-[10px] text-muted">▼</span>
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <ul
            className="scrollbar-hidden absolute left-0 top-full z-50 mt-1 max-h-dropdown w-max min-w-full overflow-y-auto rounded-xl border border-grid-line bg-card py-1 shadow-lg"
            role="listbox"
          >
            {targetOptions.map(({ target, count }) => {
              const active = targetsEqual(target, typingTarget)
              return (
                <li key={targetKey(target)} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onTypingTarget(target)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition hover:bg-tile ${
                      active ? "bg-tile text-foreground" : "text-foreground"
                    }`}
                  >
                    <span className="truncate font-medium">
                      {typingTargetLabel(target, representationTypes)}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted">{count}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      ) : null}
    </div>
  )
}

function targetsEqual(left: TypingInputTarget, right: TypingInputTarget): boolean {
  if (left.kind !== right.kind) return false
  if (left.kind === "original" && right.kind === "original") return true
  if (left.kind === "representation_type" && right.kind === "representation_type") {
    return left.representationTypeId === right.representationTypeId
  }
  return false
}

function targetKey(target: TypingInputTarget): string {
  return target.kind === "original" ? "original" : `type-${target.representationTypeId}`
}