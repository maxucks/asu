export const DEFAULT_LANGUAGE_ID = "lang-english"

export const ACTIVE_LANGUAGE_STORAGE_KEY = "asu.active_language_id"

export function readStoredLanguageId(): string | null {
  if (typeof window === "undefined") return null
  const stored = window.localStorage.getItem(ACTIVE_LANGUAGE_STORAGE_KEY)
  return stored && stored.length > 0 ? stored : null
}

export function writeStoredLanguageId(languageId: string): void {
  window.localStorage.setItem(ACTIVE_LANGUAGE_STORAGE_KEY, languageId)
}