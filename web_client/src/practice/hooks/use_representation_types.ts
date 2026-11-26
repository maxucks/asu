import type { PracticeRepository } from "@/practice/practice_repository"
import type { RepresentationTypeDto } from "@/practice/practice_repository"
import { useEffect, useState } from "react"

export function useRepresentationTypes(repo: PracticeRepository, languageId: string) {
  const [types, setTypes] = useState<readonly RepresentationTypeDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void repo.listRepresentationTypes(languageId).then((result) => {
      if (cancelled) return
      setLoading(false)
      if (result.ok) setTypes(result.value)
      else setTypes([])
    })
    return () => {
      cancelled = true
    }
  }, [languageId, repo])

  return { types, loading }
}