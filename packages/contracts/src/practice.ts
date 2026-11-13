import type { AssociationDto } from "./case"

export type PracticeCardDto = {
  readonly id: string
  readonly languageName: string
  readonly lemmaText: string
  readonly meaning: string | null
  readonly associations: readonly AssociationDto[]
}

export type PracticeQueueDto = {
  readonly cards: readonly PracticeCardDto[]
}

export const PracticeGrades = ["hard", "medium", "easy"] as const

export type PracticeGradeDto = (typeof PracticeGrades)[number]
