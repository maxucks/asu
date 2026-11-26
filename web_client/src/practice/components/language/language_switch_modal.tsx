import type { LanguageDto } from "@/core/data_sources/http_language_data_source"
import type { PracticeRepository } from "@/practice/practice_repository"
import { useCallback, useEffect, useState, type MouseEvent, type ReactNode } from "react"

type LanguageSwitchModalProps = {
  readonly open: boolean
  readonly activeLanguageId: string
  readonly repo: PracticeRepository
  readonly onClose: () => void
  readonly onSwitch: (languageId: string) => void
}

export function LanguageSwitchModal({ open, activeLanguageId, repo, onClose, onSwitch }: LanguageSwitchModalProps) {
  const [languages, setLanguages] = useState<readonly LanguageDto[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    const result = await repo.listLanguages()
    setLoading(false)
    if (!result.ok) {
      setMessage(result.error.message)
      return
    }
    setLanguages(result.value)
  }, [repo])

  useEffect(() => {
    if (!open) return
    void refresh()
  }, [open, refresh])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, open])

  if (!open) return null

  const activeLanguage = languages.find((language) => language.id === activeLanguageId)
  const totalCasesAll = languages.reduce((sum, language) => sum + language.caseCount, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation" onClick={onClose}>
      <DialogPanel
        className="flex max-h-[min(32rem,90dvh)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-grid-line bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-grid-line px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">Languages</h2>
          <p className="mt-1 text-sm text-muted">
            {loading
              ? "Loading…"
              : `${totalCasesAll} ${totalCasesAll === 1 ? "case" : "cases"} total`}
            {activeLanguage && !loading
              ? ` · ${activeLanguage.caseCount} in ${activeLanguage.name}`
              : ""}
          </p>
          <p className="mt-1 text-xs text-muted">Choose which language you are studying. Languages are configured in the database.</p>
        </div>

        <ul className="scrollbar-hidden flex-1 overflow-y-auto divide-y divide-grid-line">
          {loading ? (
            <li className="px-5 py-6 text-sm text-muted">Loading…</li>
          ) : languages.length === 0 ? (
            <li className="px-5 py-6 text-sm text-muted">No languages available.</li>
          ) : (
            languages.map((language) => {
              const active = language.id === activeLanguageId
              return (
                <li key={language.id} className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      onSwitch(language.id)
                      onClose()
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition ${active ? "bg-accent/15 ring-1 ring-accent/50" : "hover:bg-tile"}`}
                  >
                    <span className="shrink-0 text-2xl leading-none" aria-hidden>
                      {language.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-foreground">{language.name}</span>
                      <span className="text-xs text-muted">{language.caseCount} entries</span>
                    </span>
                    {active ? (
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-accent">Active</span>
                    ) : null}
                  </button>
                </li>
              )
            })
          )}
        </ul>

        {message ? (
          <div className="shrink-0 border-t border-grid-line bg-tile/50 px-5 py-3">
            <p className="text-center text-sm text-danger">{message}</p>
          </div>
        ) : null}
      </DialogPanel>
    </div>
  )
}

function DialogPanel({
  className,
  children,
  onClick,
}: {
  readonly className: string
  readonly children: ReactNode
  readonly onClick: (event: MouseEvent) => void
}) {
  return (
    <div role="dialog" aria-modal="true" className={className} onClick={onClick}>
      {children}
    </div>
  )
}