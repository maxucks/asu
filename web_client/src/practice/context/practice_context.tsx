import type { PracticeContextValue } from "@/practice/practice_context_value"
import { createContext } from "react"

export const practiceContext = createContext<PracticeContextValue | null>(null)