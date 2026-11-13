import type { Association } from "@/practice/practice_model";
import type { PracticeCard } from "@/practice/practice_model";
import {
  isPracticeSessionReadyViewState,
  type PracticeSessionPhase,
  type PracticeSessionViewState,
} from "@/practice/practice_session_view_state";

export function selectCurrentCard(
  state: PracticeSessionViewState,
): PracticeCard | null {
  if (!isPracticeSessionReadyViewState(state)) return null;
  return state.cards[state.cardIndex] ?? null;
}

export function selectFrontCaseId(state: PracticeSessionViewState): string | null {
  if (!isPracticeSessionReadyViewState(state) || state.phase !== "front") {
    return null;
  }
  return state.cards[state.cardIndex]?.id ?? null;
}

export function mergeVisibleAssociations(
  card: PracticeCard,
  sessionAssociations: readonly Association[],
): Association[] {
  return [...card.associations, ...sessionAssociations].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );
}

export function isAssociationOnCard(
  card: PracticeCard,
  associationId: string,
): boolean {
  return card.associations.some((item) => item.id === associationId);
}

export function isAssociationRevealedOnFront(
  association: Association,
  revealedHiddenAssociationIds: readonly string[],
): boolean {
  if (!association.hiddenFromPractice) return true;
  return revealedHiddenAssociationIds.includes(association.id);
}

export function isAssociationContentVisible(
  association: Association,
  phase: PracticeSessionPhase,
  revealedHiddenAssociationIds: readonly string[],
): boolean {
  if (phase === "back") return true;
  return isAssociationRevealedOnFront(association, revealedHiddenAssociationIds);
}
