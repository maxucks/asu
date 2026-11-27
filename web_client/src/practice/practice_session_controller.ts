import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { AssociationKind } from "@/core/data_sources/http_case_data_source"
import { err, type Result } from "@/core/app_errors"
import {
  parseAssociationImageUrl,
  parseAssociationText,
  type AssociationComposeMode,
} from "@/practice/practice_utils"
import {
  PracticeErrAssociationEmptyText,
  PracticeErrAssociationInvalidImageUrl,
  PracticeErrCaseValueEmpty,
  type PracticeError,
} from "@/practice/practice_errors"
import { PracticeCard } from "@/practice/practice_model"
import type { CaseRepresentationWrite } from "@/core/data_sources/http_case_data_source"
import type { PracticeGradeDto, PracticeCardDto } from "@/practice/practice_repository"
import { PracticeGrades } from "@/practice/practice_repository"
import { parseCaseValue, parseCaseMeaning } from "@/practice/practice_model"
import type { PracticeRepository } from "@/practice/practice_repository"
import type { StudyRecordDto } from "@/core/data_sources/http_study_record_data_source"
import {
  applyPracticeGrade,
  buildPracticePackRound,
  createInitialStudyRecord,
  injectPracticePackGradeRepeats,
  studyRecordsToMap,
} from "@/practice/practice_session_pack"
import {
  createPracticeSessionViewStateAfterPackAdvance,
  createPracticeSessionViewStateAfterVocabularyReload,
  createPracticeSessionViewStateError,
  createPracticeSessionViewStateLoading,
  createPracticeSessionViewStateReady,
  createPracticeSessionViewStateReadyRevealed,
  createPracticeSessionViewStateWithAssociation,
  createPracticeSessionViewStateWithReplacedCard,
  createPracticeSessionViewStateWithSessionAssociationPatched,
  createPracticeSessionViewStateWithToggledRevealedHidden,
  createPracticeSessionViewStateWithoutSessionAssociation,
  createSessionAssociation,
  isAssociationOnCard,
  isPracticeSessionReadyViewState,
  mergeVisibleAssociations,
  selectCurrentCard,
  selectCurrentCaseId,
  selectFrontCaseId,
  type PracticeSessionViewState,
} from "@/practice/practice_session_view_state"

function isPracticeGrade(value: string): value is PracticeGradeDto {
  return (PracticeGrades as readonly string[]).includes(value)
}

export function usePracticeSessionController(
  practiceRepository: PracticeRepository,
  languageId: string,
  categoryId: string | null,
) {
  const [state, setState] = useState<PracticeSessionViewState>(createPracticeSessionViewStateLoading())
  const [savingAssociation, setSavingAssociation] = useState<AssociationComposeMode | null>(null)
  const [deletingAssociationId, setDeletingAssociationId] = useState<string | null>(null)
  const [vocabularyBusyCaseId, setVocabularyBusyCaseId] = useState<string | "create" | null>(null)
  const [deletingCaseId, setDeletingCaseId] = useState<string | null>(null)
  const [reorderingAssociations, setReorderingAssociations] = useState(false)
  const [gradingCase, setGradingCase] = useState(false)
  const [categoriesBusy, setCategoriesBusy] = useState(false)
  const stateRef = useRef(state)
  stateRef.current = state
  const studyRecordsRef = useRef<Map<string, StudyRecordDto>>(new Map())

  const syncStudyRecordsMap = useCallback((records: readonly StudyRecordDto[]) => {
    studyRecordsRef.current = studyRecordsToMap(records)
  }, [])

  const ensureStudyRecord = useCallback((caseId: string): StudyRecordDto => {
    const existing = studyRecordsRef.current.get(caseId)
    if (existing) return existing
    const created = createInitialStudyRecord(caseId)
    studyRecordsRef.current.set(caseId, created)
    return created
  }, [])

  const bootstrapSession = useCallback(async (): Promise<boolean> => {
    setState(createPracticeSessionViewStateLoading())
    const [listResult, recordsResult] = await Promise.all([
      practiceRepository.listCases(languageId, categoryId),
      practiceRepository.listStudyRecords(languageId, categoryId),
    ])

    if (!listResult.ok) {
      setState(createPracticeSessionViewStateError(listResult.error))
      return false
    }

    if (!recordsResult.ok) {
      setState(createPracticeSessionViewStateError(recordsResult.error))
      return false
    }

    const cards = listResult.value.cards.map((dto) => PracticeCard.fromDto(dto))
    syncStudyRecordsMap(recordsResult.value)

    const caseIds = cards.map((card) => card.id)
    const playQueue = buildPracticePackRound(caseIds, studyRecordsRef.current)

    if (cards.length === 0 || playQueue.length === 0) {
      setState(
        createPracticeSessionViewStateReady(cards, 0, "front", [], [], 0, cards.length, {
          playQueue: [],
          playQueueIndex: 0,
          packRound: 1,
        }),
      )
      return true
    }

    setState(
      createPracticeSessionViewStateReady(cards, 0, "front", [], [], 0, cards.length, {
        playQueue,
        playQueueIndex: 0,
        packRound: 1,
      }),
    )
    return true
  }, [categoryId, languageId, practiceRepository, syncStudyRecordsMap])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const ok = await bootstrapSession()
      if (!ok && cancelled) return
    })()
    return () => {
      cancelled = true
    }
  }, [bootstrapSession])

  const currentCard = useMemo(() => selectCurrentCard(state), [state])

  const revealedHiddenAssociationIds = useMemo(() => {
    if (!isPracticeSessionReadyViewState(state)) return []
    return state.revealedHiddenAssociationIds
  }, [state])

  const visibleAssociations = useMemo(() => {
    if (!currentCard || !isPracticeSessionReadyViewState(state)) return []
    return mergeVisibleAssociations(currentCard, state.sessionAssociations)
  }, [currentCard, state])

  const runOnCurrentCard = useCallback(
    async (save: (caseId: string) => Promise<Result<PracticeCardDto, PracticeError>>): Promise<boolean> => {
      const caseId = selectFrontCaseId(stateRef.current)
      if (!caseId) return false

      const result = await save(caseId)
      if (!result.ok) {
        setState(createPracticeSessionViewStateError(result.error))
        return false
      }

      const updatedCard = PracticeCard.fromDto(result.value)
      setState((prev) => {
        if (!isPracticeSessionReadyViewState(prev)) return prev
        return createPracticeSessionViewStateWithReplacedCard(prev, updatedCard)
      })
      return true
    },
    [],
  )

  const mutateOnCurrentCard = useCallback(
    async (
      mode: AssociationComposeMode,
      save: (caseId: string) => Promise<Result<PracticeCardDto, PracticeError>>,
    ): Promise<boolean> => {
      setSavingAssociation(mode)
      const ok = await runOnCurrentCard(save)
      setSavingAssociation(null)
      return ok
    },
    [runOnCurrentCard],
  )

  const revealAnswer = useCallback(() => {
    setState((prev) => {
      if (!isPracticeSessionReadyViewState(prev) || prev.phase !== "front") return prev
      return createPracticeSessionViewStateReadyRevealed(prev)
    })
  }, [])

  const submitGrade = useCallback(
    async (grade: PracticeGradeDto) => {
      if (!isPracticeGrade(grade)) return

      const ready = stateRef.current
      if (!isPracticeSessionReadyViewState(ready) || ready.phase !== "back") return

      const caseId = selectCurrentCaseId(ready)
      if (!caseId) return

      setGradingCase(true)
      const result = await practiceRepository.submitGrade(caseId, grade)
      setGradingCase(false)

      if (!result.ok) {
        setState(createPracticeSessionViewStateError(result.error))
        return
      }

      const record = ensureStudyRecord(caseId)
      const updatedRecord = applyPracticeGrade(record, grade, new Date())
      studyRecordsRef.current.set(caseId, updatedRecord)

      setState((prev) => {
        if (!isPracticeSessionReadyViewState(prev) || prev.phase !== "back") return prev

        let queue = injectPracticePackGradeRepeats(
          prev.playQueue,
          prev.playQueueIndex,
          caseId,
          grade,
        )
        let nextQueueIndex = prev.playQueueIndex + 1
        let packRound = prev.packRound

        const caseIds = prev.cards.map((card) => card.id)

        if (nextQueueIndex >= queue.length) {
          packRound += 1
          queue = buildPracticePackRound(caseIds, studyRecordsRef.current)
          nextQueueIndex = 0
        }

        if (queue.length === 0) {
          return createPracticeSessionViewStateReady(prev.cards, 0, "front", [], [], prev.passedCount + 1, 0, {
            playQueue: [],
            playQueueIndex: 0,
            packRound,
          })
        }

        return createPracticeSessionViewStateAfterPackAdvance(
          prev,
          queue,
          nextQueueIndex,
          packRound,
          prev.cards,
        )
      })
    },
    [ensureStudyRecord, practiceRepository],
  )

  const setCaseCategories = useCallback(
    async (caseId: string, categoryIds: readonly string[]) => {
      setCategoriesBusy(true)
      const result = await practiceRepository.setCaseCategories(caseId, categoryIds)
      setCategoriesBusy(false)
      if (!result.ok) {
        setState(createPracticeSessionViewStateError(result.error))
        return false
      }
      const updated = PracticeCard.fromDto(result.value)
      setState((prev) => {
        if (!isPracticeSessionReadyViewState(prev)) return prev
        return createPracticeSessionViewStateWithReplacedCard(prev, updated)
      })
      return true
    },
    [practiceRepository],
  )

  const toggleRevealHiddenAssociation = useCallback((associationId: string) => {
    setState((prev) => {
      if (!isPracticeSessionReadyViewState(prev)) return prev
      return createPracticeSessionViewStateWithToggledRevealedHidden(prev, associationId)
    })
  }, [])

  const addSessionAssociation = useCallback((kind: AssociationKind, contentRef?: string) => {
    setState((prev) => {
      if (!isPracticeSessionReadyViewState(prev)) return prev

      const association = createSessionAssociation(prev, kind, contentRef)
      if (!association) return prev

      return createPracticeSessionViewStateWithAssociation(prev, association)
    })
  }, [])

  const setAssociationHidden = useCallback(
    async (associationId: string, hiddenFromPractice: boolean) => {
      if (!currentCard) return false

      if (isAssociationOnCard(currentCard, associationId)) {
        const ok = await runOnCurrentCard((caseId) =>
          practiceRepository.setAssociationHiddenFromPractice(caseId, associationId, hiddenFromPractice),
        )
        if (!ok) return false

        if (hiddenFromPractice) {
          setState((prev) => {
            if (!isPracticeSessionReadyViewState(prev)) return prev
            const revealed = prev.revealedHiddenAssociationIds.filter((id) => id !== associationId)
            return createPracticeSessionViewStateReady(
              prev.cards,
              prev.cardIndex,
              prev.phase,
              prev.sessionAssociations,
              revealed,
              prev.passedCount,
              prev.totalCases,
              {
                playQueue: prev.playQueue,
                playQueueIndex: prev.playQueueIndex,
                packRound: prev.packRound,
              },
            )
          })
        }
        return true
      }

      setState((prev) => {
        if (!isPracticeSessionReadyViewState(prev)) return prev
        const revealed = hiddenFromPractice
          ? prev.revealedHiddenAssociationIds.filter((id) => id !== associationId)
          : prev.revealedHiddenAssociationIds
        const patched = createPracticeSessionViewStateWithSessionAssociationPatched(prev, associationId, (item) =>
          item.withHiddenFromPractice(hiddenFromPractice),
        )
        return createPracticeSessionViewStateReady(
          patched.cards,
          patched.cardIndex,
          patched.phase,
          patched.sessionAssociations,
          revealed,
          patched.passedCount,
          patched.totalCases,
          {
            playQueue: patched.playQueue,
            playQueueIndex: patched.playQueueIndex,
            packRound: patched.packRound,
          },
        )
      })
      return true
    },
    [currentCard, practiceRepository, runOnCurrentCard],
  )

  const deleteAssociation = useCallback(
    async (associationId: string) => {
      if (!currentCard) return false

      setDeletingAssociationId(associationId)

      let ok = false
      if (isAssociationOnCard(currentCard, associationId)) {
        ok = await runOnCurrentCard((caseId) => practiceRepository.deleteAssociation(caseId, associationId))
      } else {
        setState((prev) => {
          if (!isPracticeSessionReadyViewState(prev)) return prev
          return createPracticeSessionViewStateWithoutSessionAssociation(prev, associationId)
        })
        ok = true
      }

      setDeletingAssociationId(null)
      return ok
    },
    [currentCard, practiceRepository, runOnCurrentCard],
  )

  const addTextAssociation = useCallback(
    async (text: string, tileColor: string | null) =>
      mutateOnCurrentCard("text", (caseId) => {
        const parsed = parseAssociationText(text)
        if (parsed === null) return Promise.resolve(err(PracticeErrAssociationEmptyText))
        return practiceRepository.appendTextAssociation(caseId, parsed, tileColor)
      }),
    [mutateOnCurrentCard, practiceRepository],
  )

  const addImageAssociationFromUrl = useCallback(
    async (url: string) =>
      mutateOnCurrentCard("image_url", (caseId) => {
        const parsed = parseAssociationImageUrl(url)
        if (parsed === null) return Promise.resolve(err(PracticeErrAssociationInvalidImageUrl))
        return practiceRepository.appendImageAssociation(caseId, parsed)
      }),
    [mutateOnCurrentCard, practiceRepository],
  )

  const updateTextAssociation = useCallback(
    async (associationId: string, text: string, tileColor: string | null) =>
      mutateOnCurrentCard("text", (caseId) => {
        const parsed = parseAssociationText(text)
        if (parsed === null) return Promise.resolve(err(PracticeErrAssociationEmptyText))
        return practiceRepository.updateTextAssociation(caseId, associationId, parsed, tileColor)
      }),
    [mutateOnCurrentCard, practiceRepository],
  )

  const updateImageAssociationFromUrl = useCallback(
    async (associationId: string, url: string) =>
      mutateOnCurrentCard("image_url", (caseId) => {
        const parsed = parseAssociationImageUrl(url)
        if (parsed === null) return Promise.resolve(err(PracticeErrAssociationInvalidImageUrl))
        return practiceRepository.updateImageAssociation(caseId, associationId, parsed)
      }),
    [mutateOnCurrentCard, practiceRepository],
  )

  const reorderAssociations = useCallback(
    async (associationIds: readonly string[]) => {
      setReorderingAssociations(true)
      const ok = await runOnCurrentCard((caseId) =>
        practiceRepository.reorderAssociations(caseId, associationIds),
      )
      setReorderingAssociations(false)
      return ok
    },
    [runOnCurrentCard, practiceRepository],
  )

  const reloadQueue = useCallback(async (): Promise<boolean> => {
    const [listResult, recordsResult] = await Promise.all([
      practiceRepository.listCases(languageId, categoryId),
      practiceRepository.listStudyRecords(languageId, categoryId),
    ])
    if (!listResult.ok) {
      setState(createPracticeSessionViewStateError(listResult.error))
      return false
    }
    if (!recordsResult.ok) {
      setState(createPracticeSessionViewStateError(recordsResult.error))
      return false
    }

    syncStudyRecordsMap(recordsResult.value)

    const cards = listResult.value.cards.map((dto) => PracticeCard.fromDto(dto))
    const totalCases = cards.length
    const caseIds = cards.map((card) => card.id)
    const playQueue = buildPracticePackRound(caseIds, studyRecordsRef.current)

    setState((prev) => {
      if (!isPracticeSessionReadyViewState(prev)) {
        if (totalCases === 0) {
          return createPracticeSessionViewStateReady([], 0, "front", [], [], 0, 0, {
            playQueue: [],
            playQueueIndex: 0,
            packRound: 1,
          })
        }
        return createPracticeSessionViewStateReady(cards, 0, "front", [], [], 0, totalCases, {
          playQueue,
          playQueueIndex: 0,
          packRound: 1,
        })
      }

      const activeCaseId = prev.playQueue[prev.playQueueIndex]
      const stillInDeck = activeCaseId ? caseIds.includes(activeCaseId) : false
      let nextPack = stillInDeck
        ? {
            playQueue: prev.playQueue.filter((id) => caseIds.includes(id)),
            playQueueIndex: prev.playQueueIndex,
            packRound: prev.packRound,
          }
        : { playQueue, playQueueIndex: 0, packRound: prev.packRound }

      if (stillInDeck && nextPack.playQueue.length > 0) {
        nextPack = {
          ...nextPack,
          playQueueIndex: Math.min(prev.playQueueIndex, nextPack.playQueue.length - 1),
        }
      }

      return createPracticeSessionViewStateAfterVocabularyReload(prev, cards, totalCases, nextPack)
    })
    return true
  }, [categoryId, practiceRepository, languageId, syncStudyRecordsMap])

  const reloadPracticeSession = useCallback(async () => bootstrapSession(), [bootstrapSession])

  const createVocabularyCase = useCallback(
    async (
      caseValue: string,
      meaning: string,
      representations?: readonly CaseRepresentationWrite[],
    ): Promise<boolean> => {
      setVocabularyBusyCaseId("create")
      const value = parseCaseValue(caseValue)
      if (value === null) {
        setState(createPracticeSessionViewStateError(PracticeErrCaseValueEmpty))
        setVocabularyBusyCaseId(null)
        return false
      }
      const result = await practiceRepository.createCase(
        languageId,
        value,
        parseCaseMeaning(meaning),
        representations,
      )
      if (!result.ok) {
        setState(createPracticeSessionViewStateError(result.error))
        setVocabularyBusyCaseId(null)
        return false
      }
      const ok = await reloadQueue()
      setVocabularyBusyCaseId(null)
      return ok
    },
    [languageId, practiceRepository, reloadQueue],
  )

  const updateVocabularyCase = useCallback(
    async (
      caseId: string,
      caseValue: string,
      meaning: string,
      representations?: readonly CaseRepresentationWrite[],
    ): Promise<boolean> => {
      setVocabularyBusyCaseId(caseId)
      const value = parseCaseValue(caseValue)
      if (value === null) {
        setState(createPracticeSessionViewStateError(PracticeErrCaseValueEmpty))
        setVocabularyBusyCaseId(null)
        return false
      }
      const result = await practiceRepository.updateCase(caseId, {
        value,
        meaning: parseCaseMeaning(meaning),
        representations,
      })
      if (!result.ok) {
        setState(createPracticeSessionViewStateError(result.error))
        setVocabularyBusyCaseId(null)
        return false
      }

      const updated = PracticeCard.fromDto(result.value)
      setState((prev) => {
        if (!isPracticeSessionReadyViewState(prev)) return prev
        return createPracticeSessionViewStateWithReplacedCard(prev, updated)
      })
      setVocabularyBusyCaseId(null)
      return true
    },
    [practiceRepository],
  )

  const linkCaseNote = useCallback(
    async (
      link: { readonly noteId: string } | { readonly name: string; readonly content: string },
    ): Promise<boolean> => runOnCurrentCard((caseId) => practiceRepository.linkCaseNote(caseId, link)),
    [practiceRepository, runOnCurrentCard],
  )

  const deleteVocabularyCase = useCallback(
    async (caseId: string): Promise<boolean> => {
      setDeletingCaseId(caseId)
      const result = await practiceRepository.deleteCase(caseId)
      if (!result.ok) {
        setState(createPracticeSessionViewStateError(result.error))
        setDeletingCaseId(null)
        return false
      }
      const ok = await reloadQueue()
      setDeletingCaseId(null)
      return ok
    },
    [practiceRepository, reloadQueue],
  )

  const sessionPhase = isPracticeSessionReadyViewState(state) ? state.phase : null

  return {
    state,
    currentCard,
    sessionPhase,
    visibleAssociations,
    revealedHiddenAssociationIds,
    revealAnswer,
    submitGrade,
    addSessionAssociation,
    addTextAssociation,
    addImageAssociationFromUrl,
    updateTextAssociation,
    updateImageAssociationFromUrl,
    toggleRevealHiddenAssociation,
    setAssociationHidden,
    deleteAssociation,
    reorderAssociations,
    savingAssociation,
    reorderingAssociations,
    gradingCase,
    categoriesBusy,
    setCaseCategories,
    reloadPracticeSession,
    deletingAssociationId,
    caseBusy: vocabularyBusyCaseId,
    deletingCaseId,
    createCase: createVocabularyCase,
    updateCase: updateVocabularyCase,
    deleteCase: deleteVocabularyCase,
    reloadQueue,
    linkCaseNote,
  }
}
