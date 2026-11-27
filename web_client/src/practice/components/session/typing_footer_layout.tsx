"use client"

import { TypingTypedLine } from "@/practice/components/session/typing_typed_line"
import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import { isTypingComplete } from "@/practice/practice_typing_live"
import { typingTargetLabel, type TypingInputTarget } from "@/practice/practice_typing_targets"
import { useCallback, useEffect, useRef, useState } from "react"

type TypingFooterLayoutProps = {
  readonly cardKey: string
  readonly expected: string
  readonly target: TypingInputTarget
  readonly representationTypes: readonly RepresentationTypeDto[]
  readonly disabled?: boolean
  readonly grading?: boolean
  readonly onComplete: () => void
  readonly onSkip: () => void
}

export function TypingFooterLayout({
  cardKey,
  expected,
  target,
  representationTypes,
  disabled,
  grading,
  onComplete,
  onSkip,
}: TypingFooterLayoutProps) {
  const [typed, setTyped] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const completeLockRef = useRef(false)

  useEffect(() => {
    setTyped("")
    completeLockRef.current = false
    if (!disabled) {
      const id = window.requestAnimationFrame(() => inputRef.current?.focus())
      return () => window.cancelAnimationFrame(id)
    }
    return undefined
  }, [cardKey, disabled])

  useEffect(() => {
    completeLockRef.current = false
  }, [cardKey])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || disabled || grading) return
      event.preventDefault()
      onSkip()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [disabled, grading, onSkip])

  const tryComplete = useCallback(
    (buffer: string) => {
      if (completeLockRef.current || disabled || grading) return
      if (!isTypingComplete(buffer, expected, target, representationTypes)) return
      completeLockRef.current = true
      onComplete()
    },
    [disabled, expected, grading, onComplete, representationTypes, target],
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || grading) return
    const next = event.target.value
    const prev = typed
    if (next.length < prev.length) {
      const shorter = prev.slice(0, next.length)
      setTyped(shorter)
      return
    }
    const added = next.slice(prev.length)
    let buffer = prev
    for (const char of added) {
      if (char.length !== 1) continue
      buffer += char
    }
    setTyped(buffer)
    tryComplete(buffer)
  }

  return (
    <footer
      className="mt-auto space-y-3"
      onClick={() => {
        if (!disabled && !grading) inputRef.current?.focus()
      }}
    >
      <p className="text-xs text-muted">
        Type the answer using {typingTargetLabel(target, representationTypes)}.
      </p>
      <div className="flex items-end justify-between gap-3">
        <TypingTypedLine
          typed={typed}
          expected={expected}
          target={target}
          representationTypes={representationTypes}
        />
        <button
          type="button"
          disabled={disabled || grading}
          onClick={(event) => {
            event.stopPropagation()
            onSkip()
          }}
          className="shrink-0 rounded-lg border border-grid-line bg-tile px-3 py-2 text-xs font-medium text-muted transition hover:border-accent/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Skip
        </button>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={typed}
        disabled={disabled || grading}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Type your answer"
        className="sr-only"
        onChange={handleChange}
      />
    </footer>
  )
}