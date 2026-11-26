import type { NoteDto, PracticeRepository } from "@/practice/practice_repository"
import { useCallback, useEffect, useState } from "react"

export function useLanguageNotes(repo: PracticeRepository, languageId: string) {
  const [notes, setNotes] = useState<readonly NoteDto[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    const result = await repo.listNotes(languageId)
    setLoading(false)
    if (result.ok) setNotes(result.value)
    return result.ok ? result.value : null
  }, [languageId, repo])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { notes, loading, refresh }
}