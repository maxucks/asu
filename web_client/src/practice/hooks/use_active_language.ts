import { usePractice } from "@/practice/hooks/use_practice"
import { useEffect, useState } from "react"

export function useActiveLanguageMeta() {
  const { repo, activeLanguageId } = usePractice()
  const [name, setName] = useState("Language")
  const [icon, setIcon] = useState("🌐")

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const result = await repo.listLanguages()
      if (cancelled || !result.ok) return
      const language = result.value.find((item) => item.id === activeLanguageId)
      if (!language) return
      setName(language.name)
      setIcon(language.icon)
    })()
    return () => {
      cancelled = true
    }
  }, [activeLanguageId, repo])

  return { name, icon }
}