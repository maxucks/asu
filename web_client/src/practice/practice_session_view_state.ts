import type { AssociationKind } from "@asu/contracts"
import type { PracticeError } from "@/practice/practice_errors"
import { Association, type PracticeAssociation, type PracticeCard } from "@/practice/practice_model"

export type PracticeSessionPhase = "front" | "back"

export type PracticeSessionReadyViewState = {
  readonly status: "ready"
  readonly cards: readonly PracticeCard[]
  readonly cardIndex: number
  readonly phase: PracticeSessionPhase
  readonly sessionAssociations: readonly Association[]
  readonly revealedHiddenAssociationIds: readonly string[]
}

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
): PracticeSessionReadyViewState {
  return {
    status: "ready",
    cards,
    cardIndex,
    phase,
    sessionAssociations,
    revealedHiddenAssociationIds,
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
  )
}

export function createPracticeSessionViewStateAfterGrade(
  ready: PracticeSessionReadyViewState,
): PracticeSessionViewState {
  const nextIndex = ready.cardIndex + 1
  if (nextIndex >= ready.cards.length) {
    return createPracticeSessionViewStateFinished()
  }
  return createPracticeSessionViewStateReady(ready.cards, nextIndex, "front")
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
  )
}

export function createPracticeSessionViewStateWithReplacedCard(
  ready: PracticeSessionReadyViewState,
  card: PracticeCard,
): PracticeSessionReadyViewState {
  const cards = ready.cards.map((entry, index) => (index === ready.cardIndex ? card : entry))
  return createPracticeSessionViewStateReady(
    cards,
    ready.cardIndex,
    ready.phase,
    ready.sessionAssociations,
    ready.revealedHiddenAssociationIds,
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
  )
}

export function createSessionAssociation(
  ready: PracticeSessionReadyViewState,
  kind: AssociationKind,
  contentRef?: string,
): Association | null {
  if (kind === "text") return null

  const card = ready.cards[ready.cardIndex]
  if (!card) return null

  const sortOrder = card.associations.length + ready.sessionAssociations.length
  const ref = contentRef ?? `stub:${kind}`
  return Association.sessionCue(card.id, kind, ref, sortOrder)
}

export function selectCurrentCard(state: PracticeSessionViewState): PracticeCard | null {
  if (!isPracticeSessionReadyViewState(state)) return null
  return state.cards[state.cardIndex] ?? null
}

export function selectFrontCaseId(state: PracticeSessionViewState): string | null {
  if (!isPracticeSessionReadyViewState(state) || state.phase !== "front") {
    return null
  }
  return state.cards[state.cardIndex]?.id ?? null
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
