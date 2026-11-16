import { practiceContext } from "@/practice/context/practice_context"
import type { PracticeContextValue } from "@/practice/practice_context_value"
import type { PracticeRepository } from "@/practice/practice_repository"
import { useContext } from "react"

export function usePractice(): PracticeContextValue {
  const value = useContext(practiceContext)
  if (!value) throw new Error("usePractice must run under practiceContext.Provider")
  return value
}

export function usePracticeRepo(): PracticeRepository {
  return usePractice().repo
}