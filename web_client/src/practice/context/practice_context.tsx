import type { PracticeContextValue } from "@/practice/practice_context_value"
import { createContext, type ReactNode } from "react"

export const practiceContext = createContext<PracticeContextValue | null>(null)

export function PracticeContextProvider({
  value,
  children,
}: {
  readonly value: PracticeContextValue
  readonly children: ReactNode
}) {
  return <practiceContext.Provider value={value}>{children}</practiceContext.Provider>
}