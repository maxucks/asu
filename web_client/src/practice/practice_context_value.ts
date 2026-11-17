import type { PracticeRepository } from "@/practice/practice_repository"

export type PracticeContextValue = {
  readonly repo: PracticeRepository
  readonly activeLanguageId: string
  readonly setActiveLanguageId: (languageId: string) => void
}