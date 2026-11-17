const STORAGE_PREFIX = "asu.practice_category."

export function readStoredCategoryId(languageId: string): string | null {
  if (typeof window === "undefined") return null
  try {
    const value = window.localStorage.getItem(`${STORAGE_PREFIX}${languageId}`)
    return value && value.length > 0 ? value : null
  } catch {
    return null
  }
}

export function writeStoredCategoryId(languageId: string, categoryId: string | null) {
  if (typeof window === "undefined") return
  try {
    const key = `${STORAGE_PREFIX}${languageId}`
    if (categoryId) window.localStorage.setItem(key, categoryId)
    else window.localStorage.removeItem(key)
  } catch {
    // ignore quota / private mode
  }
}