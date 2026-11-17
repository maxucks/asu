import { err, type Result } from "@/core/app_errors"
import type { PracticeCardDto } from "@/practice/practice_repository"
import { PracticeCard } from "@/practice/practice_model"
import {
  PracticeErrAssociationEmptyText,
  PracticeErrAssociationInvalidImageUrl,
  type PracticeError,
} from "@/practice/practice_errors"
import { parseCaseLemma, parseCaseMeaning } from "@/practice/practice_model"
import type { PracticeRepository } from "@/practice/practice_repository"
import {
  parseAssociationImageUrl,
  parseAssociationText,
  type AssociationComposeMode,
} from "@/practice/practice_utils"
import { useCallback, useEffect, useState } from "react"

export function useCaseDetailController(
  repo: PracticeRepository,
  source: PracticeCardDto,
  onCardChange: (card: PracticeCardDto) => void,
  onDeleted: () => void,
) {
  const [card, setCard] = useState(() => PracticeCard.fromDto(source))
  const [savingAssociation, setSavingAssociation] = useState<AssociationComposeMode | null>(null)
  const [caseBusy, setCaseBusy] = useState<false | "update" | "delete">(false)
  const [deletingAssociationId, setDeletingAssociationId] = useState<string | null>(null)
  const [revealedHiddenAssociationIds, setRevealedHiddenAssociationIds] = useState<readonly string[]>([])

  useEffect(() => {
    setCard(PracticeCard.fromDto(source))
    setRevealedHiddenAssociationIds([])
  }, [source])

  const applyCard = useCallback(
    (dto: PracticeCardDto) => {
      setCard(PracticeCard.fromDto(dto))
      onCardChange(dto)
      return true
    },
    [onCardChange],
  )

  const runMutation = useCallback(
    async (save: () => Promise<Result<PracticeCardDto, PracticeError>>): Promise<boolean> => {
      const result = await save()
      if (!result.ok) return false
      return applyCard(result.value)
    },
    [applyCard],
  )

  const mutateAssociation = useCallback(
    async (mode: AssociationComposeMode, save: () => Promise<Result<PracticeCardDto, PracticeError>>) => {
      setSavingAssociation(mode)
      const okResult = await runMutation(save)
      setSavingAssociation(null)
      return okResult
    },
    [runMutation],
  )

  const updateCase = useCallback(
    async (lemma: string, meaning: string): Promise<boolean> => {
      const lemmaText = parseCaseLemma(lemma)
      if (lemmaText === null) return false
      setCaseBusy("update")
      const okResult = await runMutation(() =>
        repo.updateCase(card.id, { lemmaText, meaning: parseCaseMeaning(meaning) }),
      )
      setCaseBusy(false)
      return okResult
    },
    [card.id, repo, runMutation],
  )

  const deleteCase = useCallback(async (): Promise<boolean> => {
    setCaseBusy("delete")
    const result = await repo.deleteCase(card.id)
    setCaseBusy(false)
    if (!result.ok) return false
    onDeleted()
    return true
  }, [card.id, onDeleted, repo])

  const addTextAssociation = useCallback(
    async (text: string) =>
      mutateAssociation("text", () => {
        const parsed = parseAssociationText(text)
        if (parsed === null) return Promise.resolve(err(PracticeErrAssociationEmptyText))
        return repo.appendTextAssociation(card.id, parsed)
      }),
    [card.id, mutateAssociation, repo],
  )

  const addImageAssociationFromUrl = useCallback(
    async (url: string) =>
      mutateAssociation("image_url", () => {
        const parsed = parseAssociationImageUrl(url)
        if (parsed === null) return Promise.resolve(err(PracticeErrAssociationInvalidImageUrl))
        return repo.appendImageAssociation(card.id, parsed)
      }),
    [card.id, mutateAssociation, repo],
  )

  const updateTextAssociation = useCallback(
    async (associationId: string, text: string) =>
      mutateAssociation("text", () => {
        const parsed = parseAssociationText(text)
        if (parsed === null) return Promise.resolve(err(PracticeErrAssociationEmptyText))
        return repo.updateTextAssociation(card.id, associationId, parsed)
      }),
    [card.id, mutateAssociation, repo],
  )

  const updateImageAssociationFromUrl = useCallback(
    async (associationId: string, url: string) =>
      mutateAssociation("image_url", () => {
        const parsed = parseAssociationImageUrl(url)
        if (parsed === null) return Promise.resolve(err(PracticeErrAssociationInvalidImageUrl))
        return repo.updateImageAssociation(card.id, associationId, parsed)
      }),
    [card.id, mutateAssociation, repo],
  )

  const setAssociationHidden = useCallback(
    async (associationId: string, hiddenFromPractice: boolean) => {
      const okResult = await runMutation(() =>
        repo.setAssociationHiddenFromPractice(card.id, associationId, hiddenFromPractice),
      )
      if (okResult && hiddenFromPractice) {
        setRevealedHiddenAssociationIds((ids) => ids.filter((id) => id !== associationId))
      }
      return okResult
    },
    [card.id, repo, runMutation],
  )

  const deleteAssociation = useCallback(
    async (associationId: string) => {
      setDeletingAssociationId(associationId)
      const okResult = await runMutation(() => repo.deleteAssociation(card.id, associationId))
      setDeletingAssociationId(null)
      return okResult
    },
    [card.id, repo, runMutation],
  )

  const toggleRevealHiddenAssociation = useCallback((associationId: string) => {
    setRevealedHiddenAssociationIds((ids) =>
      ids.includes(associationId) ? ids.filter((id) => id !== associationId) : [...ids, associationId],
    )
  }, [])

  return {
    card,
    savingAssociation,
    deletingAssociationId,
    caseBusy,
    revealedHiddenAssociationIds,
    updateCase,
    deleteCase,
    addTextAssociation,
    addImageAssociationFromUrl,
    updateTextAssociation,
    updateImageAssociationFromUrl,
    setAssociationHidden,
    deleteAssociation,
    toggleRevealHiddenAssociation,
  }
}

export type CaseDetailController = ReturnType<typeof useCaseDetailController>