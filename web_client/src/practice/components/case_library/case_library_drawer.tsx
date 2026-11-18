import { CaseLibraryAddCaseControl } from "@/practice/components/case_library/case_library_add_case_control"
import { CaseLibraryDetail } from "@/practice/components/case_library/case_library_detail"
import { CaseLibraryCaseList } from "@/practice/components/case_library/case_library_case_list"
import { IconButton, IconClose } from "@/practice/components/session/icon_button"
import { parseCaseMeaning } from "@/practice/practice_model"
import {
  readStoredLibraryCaseId,
  writeStoredLibraryCaseId,
} from "@/practice/practice_language"
import type { CategoryDto, PracticeCardDto, PracticeRepository } from "@/practice/practice_repository"
import { useCallback, useEffect, useState } from "react"

type CaseLibraryDrawerProps = {
  readonly open: boolean
  readonly languageId: string
  readonly languageName?: string
  readonly languageIcon?: string
  readonly repo: PracticeRepository
  readonly onClose: () => void
  readonly onVocabularyChange?: () => void
}

function resolveSelectedCaseId(cards: readonly PracticeCardDto[], languageId: string, preferId?: string | null): string | null {
  if (cards.length === 0) return null

  const candidates = [preferId, readStoredLibraryCaseId(languageId)].filter(
    (id): id is string => typeof id === "string" && id.length > 0,
  )

  for (const id of candidates) {
    if (cards.some((card) => card.id === id)) return id
  }

  return cards[0].id
}

export function CaseLibraryDrawer({
  open,
  languageId,
  languageName,
  languageIcon,
  repo,
  onClose,
  onVocabularyChange,
}: CaseLibraryDrawerProps) {
  const [cards, setCards] = useState<readonly PracticeCardDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [createBusy, setCreateBusy] = useState(false)
  const [categories, setCategories] = useState<readonly CategoryDto[]>([])

  const refreshCategoryMeta = useCallback(async () => {
    const result = await repo.listCategories(languageId)
    if (result.ok) setCategories(result.value)
  }, [languageId, repo])

  const selectCase = useCallback(
    (caseId: string | null) => {
      setSelectedId(caseId)
      if (caseId) writeStoredLibraryCaseId(languageId, caseId)
    },
    [languageId],
  )

  const loadCases = useCallback(
    async (preferId?: string | null) => {
      setLoading(true)
      setError(null)
      const result = await repo.listCases(languageId)
      setLoading(false)
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      setCards(result.value.cards)
      selectCase(resolveSelectedCaseId(result.value.cards, languageId, preferId))
    },
    [languageId, repo, selectCase],
  )

  useEffect(() => {
    if (!open) return
    void loadCases(readStoredLibraryCaseId(languageId))
    void refreshCategoryMeta()
  }, [open, languageId, loadCases, refreshCategoryMeta])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, open])

  if (!open) return null

  const selected = selectedId ? (cards.find((card) => card.id === selectedId) ?? null) : null
  const splitView = cards.length > 0

  function handleCardChange(next: PracticeCardDto) {
    setCards((current) => current.map((entry) => (entry.id === next.id ? next : entry)))
    onVocabularyChange?.()
  }

  function handleDeleted() {
    const remaining = cards.filter((card) => card.id !== selectedId)
    setCards(remaining)
    selectCase(resolveSelectedCaseId(remaining, languageId))
    onVocabularyChange?.()
  }

  async function handleCreate(lemma: string, meaning: string): Promise<boolean> {
    setCreateBusy(true)
    const result = await repo.createCase(languageId, lemma, parseCaseMeaning(meaning))
    setCreateBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return false
    }
    await loadCases(result.value.id)
    onVocabularyChange?.()
    return true
  }

  return (
    <div className="fixed inset-0 z-[55] flex justify-end" role="presentation">
      <button
        type="button"
        aria-label="Close vocabulary library"
        className="min-w-[max(1.25rem,5vw)] flex-1 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Vocabulary library"
        className={`flex h-dvh max-w-[94vw] shrink-0 flex-col overflow-hidden rounded-l-2xl border border-grid-line bg-background ${splitView ? "w-[min(94vw,72rem)]" : "w-[min(94vw,40rem)]"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center gap-2 border-b border-grid-line px-4 py-3">
          <span className="shrink-0 text-2xl leading-none" aria-hidden title={languageName}>
            {languageIcon ?? "🌐"}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-foreground">{languageName ?? "Vocabulary"}</h2>
            <p className="text-xs text-muted">{cards.length} entries</p>
          </div>
          <CaseLibraryAddCaseControl saving={createBusy} onCreate={(lemma, meaning) => handleCreate(lemma, meaning)} />
          <IconButton label="Close library" onClick={onClose}>
            <IconClose />
          </IconButton>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <section className={`flex min-h-0 flex-col ${splitView ? "w-1/2 min-w-0 border-r border-grid-line" : "w-full"}`}>
            <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {loading ? <p className="text-sm text-muted">Loading…</p> : null}
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              {!loading && cards.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-grid-line bg-card px-4 py-8 text-center">
                  <p className="text-sm text-muted">No entries yet.</p>
                  <CaseLibraryAddCaseControl saving={createBusy} onCreate={(lemma, meaning) => handleCreate(lemma, meaning)} />
                </div>
              ) : null}
              {cards.length > 0 ? (
                <CaseLibraryCaseList cards={cards} selectedId={selectedId} onSelect={(id) => selectCase(id)} />
              ) : null}
            </div>
          </section>

          {selected ? (
            <CaseLibraryDetail
              key={selected.id}
              card={selected}
              languageId={languageId}
              categories={categories}
              repo={repo}
              onCardChange={handleCardChange}
              onDeleted={handleDeleted}
              onCategoriesMetaChange={() => void refreshCategoryMeta()}
            />
          ) : null}
        </div>
      </div>

    </div>
  )
}