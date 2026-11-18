export const StudyModes = ["normal", "struggle", "freeze", "berserk"] as const

export type StudyModeDto = (typeof StudyModes)[number]

export type StudyRecordSnapshotDto = {
  readonly level: number
  readonly points: number
  readonly studyMode: StudyModeDto
  readonly lockedUntil: string | null
  readonly modeUntil: string | null
  readonly struggleSuggested: boolean
  readonly freezeAvailable: boolean
  readonly streakCount: number
  readonly locked: boolean
}

export const PracticeOutcomes = ["dont_know", "compare_wrong", "compare_correct"] as const

export type PracticeOutcomeDto = (typeof PracticeOutcomes)[number]

export type AppSettingsDto = {
  readonly appVersion: string
  readonly learningCycleMinutes: number
  readonly learningCycleMs: number
}