import type { AssociationKind } from "@/core/data_sources/case_data_source";
import type { PracticeError } from "@/practice/practice_errors";
import { Association, type PracticeCard } from "@/practice/practice_model";

export type PracticeSessionPhase = "front" | "back";

export type PracticeSessionReadyViewState = {
  readonly status: "ready";
  readonly cards: readonly PracticeCard[];
  readonly cardIndex: number;
  readonly phase: PracticeSessionPhase;
  readonly sessionAssociations: readonly Association[];
};

export type PracticeSessionViewState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly error: PracticeError }
  | PracticeSessionReadyViewState
  | { readonly status: "finished" };

export function isPracticeSessionReadyViewState(
  state: PracticeSessionViewState,
): state is PracticeSessionReadyViewState {
  return state.status === "ready";
}

export function createPracticeSessionViewStateLoading(): PracticeSessionViewState {
  return { status: "loading" };
}

export function createPracticeSessionViewStateError(
  error: PracticeError,
): PracticeSessionViewState {
  return { status: "error", error };
}

export function createPracticeSessionViewStateFinished(): PracticeSessionViewState {
  return { status: "finished" };
}

export function createPracticeSessionViewStateReady(
  cards: readonly PracticeCard[],
  cardIndex = 0,
  phase: PracticeSessionPhase = "front",
  sessionAssociations: readonly Association[] = [],
): PracticeSessionReadyViewState {
  return {
    status: "ready",
    cards,
    cardIndex,
    phase,
    sessionAssociations,
  };
}

export function createPracticeSessionViewStateReadyRevealed(
  ready: PracticeSessionReadyViewState,
): PracticeSessionReadyViewState {
  return createPracticeSessionViewStateReady(
    ready.cards,
    ready.cardIndex,
    "back",
    ready.sessionAssociations,
  );
}

export function createPracticeSessionViewStateAfterGrade(
  ready: PracticeSessionReadyViewState,
): PracticeSessionViewState {
  const nextIndex = ready.cardIndex + 1;
  if (nextIndex >= ready.cards.length) {
    return createPracticeSessionViewStateFinished();
  }
  return createPracticeSessionViewStateReady(ready.cards, nextIndex, "front", []);
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
  );
}

export function createPracticeSessionViewStateWithReplacedCard(
  ready: PracticeSessionReadyViewState,
  card: PracticeCard,
): PracticeSessionReadyViewState {
  const cards = ready.cards.map((entry, index) =>
    index === ready.cardIndex ? card : entry,
  );
  return createPracticeSessionViewStateReady(
    cards,
    ready.cardIndex,
    ready.phase,
    ready.sessionAssociations,
  );
}

export function createSessionAssociationStub(
  ready: PracticeSessionReadyViewState,
  kind: AssociationKind,
): Association | null {
  if (kind === "text") return null;

  const card = ready.cards[ready.cardIndex];
  if (!card) return null;

  const nextOrder = card.associations.length + ready.sessionAssociations.length;
  return Association.kindStub(card.id, kind, nextOrder);
}
