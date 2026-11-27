"use client"

import { LibraryEmptyHint } from "@/practice/components/library/library_empty_hint"
import { CaseLibraryAddCaseControl } from "@/practice/components/case_library/case_library_add_case_control"
import { CaseLibraryDetail } from "@/practice/components/case_library/case_library_detail"
import { CaseLibraryTile } from "@/practice/components/case_library/case_library_tile"
import { parseCaseMeaning } from "@/practice/practice_model"
import {
  readStoredLibraryCaseId,
  writeStoredLibraryCaseId,
} from "@/practice/practice_language"
import type { CaseRepresentationWrite } from "@/core/data_sources/http_case_data_source"
import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import { representationWritesFromDrafts } from "@/practice/practice_representation"
import type { CategoryDto, PracticeCardDto, PracticeRepository } from "@/practice/practice_repository"
import { useCallback, useEffect, useState } from "react"

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

type UseCaseLibraryPanelOptions = {
  readonly active: boolean
  readonly languageId: string
  readonly repo: PracticeRepository
  readonly representationTypes: readonly RepresentationTypeDto[]
  readonly onVocabularyChange?: () => void
  readonly onOpenLinkedNote?: (noteId: string, linkCaseId: string) => void
}

export function useCaseLibraryPanel({
  active,
  languageId,
  repo,
  representationTypes,
  onVocabularyChange,
  onOpenLinkedNote,
}: UseCaseLibraryPanelOptions) {
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
    if (!active) return
    void loadCases(readStoredLibraryCaseId(languageId))
    void refreshCategoryMeta()
  }, [active, languageId, loadCases, refreshCategoryMeta])

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

  async function handleCreate(
    value: string,
    meaning: string,
    representationDrafts: Record<number, string>,
  ): Promise<boolean> {
    setCreateBusy(true)
    const representations: readonly CaseRepresentationWrite[] = representationWritesFromDrafts(
      representationTypes,
      representationDrafts,
    )
    const result = await repo.createCase(languageId, value, parseCaseMeaning(meaning), representations)
    setCreateBusy(false)
    if (!result.ok) {
      setError(result.error.message)
      return false
    }
    await loadCases(result.value.id)
    onVocabularyChange?.()
    return true
  }

  const addControl = (
    <CaseLibraryAddCaseControl
      representationTypes={representationTypes}
      saving={createBusy}
      onCreate={(value, meaning, representationDrafts) => handleCreate(value, meaning, representationDrafts)}
    />
  )

  return {
    cardsCount: cards.length,
    splitView,
    addControl,
    body: (
      <CaseLibraryPanelBody
        loading={loading}
        error={error}
        cards={cards}
        selectedId={selectedId}
        selected={selected}
        createBusy={createBusy}
        representationTypes={representationTypes}
        languageId={languageId}
        categories={categories}
        repo={repo}
        splitView={splitView}
        onSelectCase={selectCase}
        onCreate={handleCreate}
        onCardChange={handleCardChange}
        onDeleted={handleDeleted}
        onCategoriesMetaChange={() => void refreshCategoryMeta()}
        onOpenLinkedNote={onOpenLinkedNote}
      />
    ),
  }
}

type CaseLibraryPanelBodyProps = {
  readonly loading: boolean
  readonly error: string | null
  readonly cards: readonly PracticeCardDto[]
  readonly selectedId: string | null
  readonly selected: PracticeCardDto | null
  readonly createBusy: boolean
  readonly representationTypes: readonly RepresentationTypeDto[]
  readonly languageId: string
  readonly categories: readonly CategoryDto[]
  readonly repo: PracticeRepository
  readonly splitView: boolean
  readonly onSelectCase: (id: string) => void
  readonly onCreate: (
    value: string,
    meaning: string,
    representationDrafts: Record<number, string>,
  ) => Promise<boolean>
  readonly onCardChange: (card: PracticeCardDto) => void
  readonly onDeleted: () => void
  readonly onCategoriesMetaChange: () => void
  readonly onOpenLinkedNote?: (noteId: string, linkCaseId: string) => void
}

function CaseLibraryPanelBody(props: CaseLibraryPanelBodyProps) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <section className={`flex min-h-0 flex-col ${props.splitView ? "w-1/2 min-w-0 border-r border-grid-line" : "w-full"}`}>
        <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {props.loading ? <p className="text-sm text-muted">Loading…</p> : null}
          {props.error ? <p className="text-sm text-danger">{props.error}</p> : null}
          {!props.loading && props.cards.length === 0 ? (
            <LibraryEmptyHint
              message="No words in this language yet."
              hint="Use Add case in the header to create one."
            />
          ) : null}
          {props.cards.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {props.cards.map((card) => (
                <li key={card.id}>
                  <CaseLibraryTile
                    card={card}
                    selected={card.id === props.selectedId}
                    onSelect={() => props.onSelectCase(card.id)}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {props.selected ? (
        <CaseLibraryDetail
          key={props.selected.id}
          card={props.selected}
          languageId={props.languageId}
          categories={props.categories}
          repo={props.repo}
          onCardChange={props.onCardChange}
          onDeleted={props.onDeleted}
          onCategoriesMetaChange={props.onCategoriesMetaChange}
          representationTypes={props.representationTypes}
          onOpenLinkedNote={
            props.onOpenLinkedNote
              ? (noteId) => props.onOpenLinkedNote?.(noteId, props.selected!.id)
              : undefined
          }
        />
      ) : null}
    </div>
  )
}
