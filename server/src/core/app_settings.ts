const DEFAULT_LEARNING_CYCLE_MINUTES = 240

export type AppSettingsDto = {
  readonly appVersion: string
  readonly learningCycleMinutes: number
  readonly learningCycleMs: number
}

export function learningCycleMsFromEnv(): number {
  const raw = process.env.LEARNING_CYCLE_MINUTES
  const minutes = raw ? Number.parseInt(raw, 10) : DEFAULT_LEARNING_CYCLE_MINUTES
  if (!Number.isFinite(minutes) || minutes < 5) {
    return DEFAULT_LEARNING_CYCLE_MINUTES * 60_000
  }
  return minutes * 60_000
}

export function readAppSettings(): AppSettingsDto {
  const learningCycleMs = learningCycleMsFromEnv()
  return {
    appVersion: "1.0.1",
    learningCycleMinutes: Math.round(learningCycleMs / 60_000),
    learningCycleMs,
  }
}
