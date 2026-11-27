import type { AssociationKind } from "@/core/data_sources/http_case_data_source"
import type { PracticeError } from "@/practice/practice_errors"
import { Association, type PracticeAssociation, type PracticeCard } from "@/practice/practice_model"
import { cardIndexForCaseId } from "@/practice/practice_session_pack"

export type PracticeSessionPhase = "front" | "back"

export type PracticePackViewState = {
  readonly playQueue: readonly string[]
  readonly playQueueIndex: number
  readonly packRound: number
}

export type PracticeSessionReadyViewState = {
  readonly status: "ready"
  readonly cards: readonly PracticeCard[]
  readonly cardIndex: number
  readonly phase: PracticeSessionPhase
  readonly sessionAssociations: readonly Association[]
  readonly revealedHiddenAssociationIds: readonly string[]
  readonly passedCount: number
  readonly totalCases: number
} & PracticePackViewState

export type PracticeSessionViewState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly error: PracticeError }
  | PracticeSessionReadyViewState
  | { readonly status: "finished" }

export function isPracticeSessionReadyViewState(
  state: PracticeSessionViewState,
): state is PracticeSessionReadyViewState {
  return state.status === "ready"
}

export function selectPlayQueueCaseId(ready: PracticeSessionReadyViewState): string | null {
  return ready.playQueue[ready.playQueueIndex] ?? null
}

function inheritPack(ready: PracticePackViewState): PracticePackViewState {
  return {
    playQueue: ready.playQueue,
    playQueueIndex: ready.playQueueIndex,
    packRound: ready.packRound,
  }
}

export function createPracticeSessionViewStateLoading(): PracticeSessionViewState {
  return { status: "loading" }
}

export function createPracticeSessionViewStateError(error: PracticeError): PracticeSessionViewState {
  return { status: "error", error }
}

export function createPracticeSessionViewStateFinished(): PracticeSessionViewState {
  return { status: "finished" }
}

export function createPracticeSessionViewStateReady(
  cards: readonly PracticeCard[],
  cardIndex = 0,
  phase: PracticeSessionPhase = "front",
  sessionAssociations: readonly Association[] = [],
  revealedHiddenAssociationIds: readonly string[] = [],
  passedCount = 0,
  totalCases?: number,
  pack?: Partial<PracticePackViewState>,
): PracticeSessionReadyViewState {
  const defaultQueue = cards.map((card) => card.id)
  const playQueue = pack?.playQueue ?? defaultQueue
  const playQueueIndex = pack?.playQueueIndex ?? Math.min(cardIndex, Math.max(0, playQueue.length - 1))
  const queueCaseId = playQueue[playQueueIndex]
  const resolvedCardIndex =
    queueCaseId !== undefined ? cardIndexForCaseId(cards, queueCaseId) : Math.min(cardIndex, Math.max(0, cards.length - 1))

  return {
    status: "ready",
    cards,
    cardIndex: resolvedCardIndex,
    phase,
    sessionAssociations,
    revealedHiddenAssociationIds,
    passedCount,
    totalCases: totalCases ?? cards.length,
    playQueue,
    playQueueIndex,
    packRound: pack?.packRound ?? 1,
  }
}

export function createPracticeSessionViewStateReadyRevealed(
  ready: PracticeSessionReadyViewState,
): PracticeSessionReadyViewState {
  return createPracticeSessionViewStateReady(
    ready.cards,
    ready.cardIndex,
    "back",
    ready.sessionAssociations,
    ready.revealedHiddenAssociationIds,
    ready.passedCount,
    ready.totalCases,
    inheritPack(ready),
  )
}

export function createPracticeSessionViewStateAfterPackAdvance(
  ready: PracticeSessionReadyViewState,
  nextQueue: readonly string[],
  nextQueueIndex: number,
  nextPackRound: number,
  cards: readonly PracticeCard[],
): PracticeSessionReadyViewState {
  const caseId = nextQueue[nextQueueIndex]
  const cardIndex = cardIndexForCaseId(cards, caseId)

  return createPracticeSessionViewStateReady(
    cards,
    cardIndex,
    "front",
    [],
    [],
    ready.passedCount + 1,
    ready.totalCases,
    {
      playQueue: nextQueue,
      playQueueIndex: nextQueueIndex,
      packRound: nextPackRound,
    },
  )
}

export function createPracticeSessionViewStateWithAssociation(
  ready: PracticeSessionReadyViewState,
  association: Association,
): PracticeSessionReadyViewState {
  return createPracticeSessionViewStateReady(
    ready.cards,
    ready.cardIndex,
    ready.phase,
    [...ready.sessionAssociations, association],
    ready.revealedHiddenAssociationIds,
    ready.passedCount,
    ready.totalCases,
    inheritPack(ready),
  )
}

export function createPracticeSessionViewStateWithReplacedCard(
  ready: PracticeSessionReadyViewState,
  card: PracticeCard,
): PracticeSessionReadyViewState {
  const cards = ready.cards.map((entry) => (entry.id === card.id ? card : entry))
  const activeCaseId = selectPlayQueueCaseId(ready)
  const cardIndex = activeCaseId ? cardIndexForCaseId(cards, activeCaseId) : ready.cardIndex

  return createPracticeSessionViewStateReady(
    cards,
    cardIndex,
    ready.phase,
    ready.sessionAssociations,
    ready.revealedHiddenAssociationIds,
    ready.passedCount,
    ready.totalCases,
    inheritPack(ready),
  )
}

export function createPracticeSessionViewStateAfterVocabularyReload(
  ready: PracticeSessionReadyViewState,
  cards: readonly PracticeCard[],
  totalCases: number,
  pack: PracticePackViewState,
): PracticeSessionViewState {
  if (cards.length === 0) {
    return createPracticeSessionViewStateReady([], 0, "front", [], [], ready.passedCount, 0, {
      playQueue: [],
      playQueueIndex: 0,
      packRound: 1,
    })
  }

  const activeId = selectPlayQueueCaseId(ready)
  let playQueueIndex = pack.playQueueIndex
  if (activeId && pack.playQueue.includes(activeId)) {
    playQueueIndex = pack.playQueue.indexOf(activeId)
  }

  return createPracticeSessionViewStateReady(
    cards,
    cardIndexForCaseId(cards, pack.playQueue[playQueueIndex]),
    ready.phase,
    ready.sessionAssociations,
    ready.revealedHiddenAssociationIds,
    ready.passedCount,
    totalCases,
    {
      playQueue: pack.playQueue,
      playQueueIndex,
      packRound: pack.packRound,
    },
  )
}

export function createPracticeSessionViewStateWithToggledRevealedHidden(
  ready: PracticeSessionReadyViewState,
  associationId: string,
): PracticeSessionReadyViewState {
  const revealed = ready.revealedHiddenAssociationIds.includes(associationId)
    ? ready.revealedHiddenAssociationIds.filter((id) => id !== associationId)
    : [...ready.revealedHiddenAssociationIds, associationId]

  return createPracticeSessionViewStateReady(
    ready.cards,
    ready.cardIndex,
    ready.phase,
    ready.sessionAssociations,
    revealed,
    ready.passedCount,
    ready.totalCases,
    inheritPack(ready),
  )
}

export function createPracticeSessionViewStateWithoutSessionAssociation(
  ready: PracticeSessionReadyViewState,
  associationId: string,
): PracticeSessionReadyViewState {
  return createPracticeSessionViewStateReady(
    ready.cards,
    ready.cardIndex,
    ready.phase,
    ready.sessionAssociations.filter((item) => item.id !== associationId),
    ready.revealedHiddenAssociationIds.filter((id) => id !== associationId),
    ready.passedCount,
    ready.totalCases,
    inheritPack(ready),
  )
}

export function createPracticeSessionViewStateWithSessionAssociationPatched(
  ready: PracticeSessionReadyViewState,
  associationId: string,
  patch: (association: Association) => Association,
): PracticeSessionReadyViewState {
  return createPracticeSessionViewStateReady(
    ready.cards,
    ready.cardIndex,
    ready.phase,
    ready.sessionAssociations.map((item) => (item.id === associationId ? patch(item) : item)),
    ready.revealedHiddenAssociationIds,
    ready.passedCount,
    ready.totalCases,
    inheritPack(ready),
  )
}

export function createSessionAssociation(
  ready: PracticeSessionReadyViewState,
  kind: AssociationKind,
  contentRef?: string,
): Association | null {
  if (kind === "text") return null

  const card = selectCurrentCard(ready)
  if (!card) return null

  const sortOrder = card.associations.length + ready.sessionAssociations.length
  const ref = contentRef ?? `stub:${kind}`
  return Association.sessionCue(card.id, kind, ref, sortOrder)
}

export function selectCurrentCard(state: PracticeSessionViewState): PracticeCard | null {
  if (!isPracticeSessionReadyViewState(state)) return null
  const caseId = selectPlayQueueCaseId(state)
  if (!caseId) return state.cards[state.cardIndex] ?? null
  return state.cards.find((card) => card.id === caseId) ?? state.cards[state.cardIndex] ?? null
}

export function selectFrontCaseId(state: PracticeSessionViewState): string | null {
  if (!isPracticeSessionReadyViewState(state) || state.phase !== "front") {
    return null
  }
  return selectPlayQueueCaseId(state)
}

export function selectCurrentCaseId(state: PracticeSessionViewState): string | null {
  if (!isPracticeSessionReadyViewState(state)) {
    return null
  }
  return selectPlayQueueCaseId(state)
}

export function mergeVisibleAssociations(
  card: PracticeCard,
  sessionAssociations: readonly PracticeAssociation[],
): PracticeAssociation[] {
  return [...card.associations, ...sessionAssociations].sort((left, right) => left.sortOrder - right.sortOrder)
}

export function isAssociationOnCard(card: PracticeCard, associationId: string): boolean {
  return card.associations.some((item) => item.id === associationId)
}

export function isAssociationRevealedOnFront(
  association: PracticeAssociation,
  revealedHiddenAssociationIds: readonly string[],
): boolean {
  if (!association.hiddenFromPractice) return true
  return revealedHiddenAssociationIds.includes(association.id)
}

export function isAssociationContentVisible(
  association: PracticeAssociation,
  phase: PracticeSessionPhase,
  revealedHiddenAssociationIds: readonly string[],
): boolean {
  if (phase === "back") return true
  return isAssociationRevealedOnFront(association, revealedHiddenAssociationIds)
}