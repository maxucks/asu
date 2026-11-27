"use client"

import { PrimaryActionButton } from "@/practice/components/session/primary_action_button"
import { useEffect } from "react"

type TypingReviewFooterLayoutProps = {
  readonly disabled?: boolean
  readonly grading?: boolean
  readonly onNext: () => void
}

export function TypingReviewFooterLayout({ disabled, grading, onNext }: TypingReviewFooterLayoutProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || disabled || grading) return
      event.preventDefault()
      onNext()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [disabled, grading, onNext])

  return (
    <footer className="mt-auto">
      <PrimaryActionButton type="button" disabled={disabled || grading} onClick={onNext}>
        Next
      </PrimaryActionButton>
    </footer>
  )
}