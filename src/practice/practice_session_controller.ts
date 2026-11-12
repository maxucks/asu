"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AssociationKind } from "@/core/data_sources/case_data_source";
import type { PracticeGradeDto } from "@/practice/practice_repository";
import { PRACTICE_GRADES } from "@/practice/practice_repository";
import { PracticeError } from "@/practice/practice_errors";
import { PracticeCard } from "@/practice/practice_model";
import type { PracticeRepository } from "@/practice/practice_repository";
import {
  createPracticeSessionViewStateAfterGrade,
  createPracticeSessionViewStateError,
  createPracticeSessionViewStateLoading,
  createPracticeSessionViewStateReady,
  createPracticeSessionViewStateReadyRevealed,
  createPracticeSessionViewStateWithAssociation,
  createPracticeSessionViewStateWithReplacedCard,
  createSessionAssociationStub,
  isPracticeSessionReadyViewState,
  type PracticeSessionViewState,
} from "@/practice/practice_session_view_state";

function isPracticeGrade(value: string): value is PracticeGradeDto {
  return (PRACTICE_GRADES as readonly string[]).includes(value);
}

export function usePracticeSessionController(practiceRepository: PracticeRepository) {
  const [state, setState] = useState<PracticeSessionViewState>(
    createPracticeSessionViewStateLoading(),
  );
  const [savingTextAssociation, setSavingTextAssociation] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await practiceRepository.getQueue();

      if (cancelled) return;

      if (!result.ok) {
        setState(createPracticeSessionViewStateError(result.error));
        return;
      }

      const cards = result.value.cards.map((dto) => PracticeCard.fromDto(dto));
      if (cards.length === 0) {
        setState(
          createPracticeSessionViewStateError(
            new PracticeError("PRACTICE_NO_CARDS", "Nothing to review in the queue."),
          ),
        );
        return;
      }

      setState(createPracticeSessionViewStateReady(cards));
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [practiceRepository]);

  const currentCard = useMemo(() => {
    if (!isPracticeSessionReadyViewState(state)) return null;
    return state.cards[state.cardIndex] ?? null;
  }, [state]);

  const visibleAssociations = useMemo(() => {
    if (!currentCard || !isPracticeSessionReadyViewState(state)) return [];
    return [...currentCard.associations, ...state.sessionAssociations].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
  }, [currentCard, state]);

  const revealAnswer = useCallback(() => {
    setState((prev) => {
      if (!isPracticeSessionReadyViewState(prev) || prev.phase !== "front") return prev;
      return createPracticeSessionViewStateReadyRevealed(prev);
    });
  }, []);

  const submitGrade = useCallback((grade: PracticeGradeDto) => {
    if (!isPracticeGrade(grade)) return;

    setState((prev) => {
      if (!isPracticeSessionReadyViewState(prev) || prev.phase !== "back") return prev;
      return createPracticeSessionViewStateAfterGrade(prev);
    });
  }, []);

  const addAssociationStub = useCallback((kind: AssociationKind) => {
    setState((prev) => {
      if (!isPracticeSessionReadyViewState(prev)) return prev;

      const stub = createSessionAssociationStub(prev, kind);
      if (!stub) return prev;

      return createPracticeSessionViewStateWithAssociation(prev, stub);
    });
  }, []);

  const addTextAssociation = useCallback(
    async (text: string) => {
      let caseId: string | null = null;

      setState((prev) => {
        if (!isPracticeSessionReadyViewState(prev) || prev.phase !== "front") return prev;
        caseId = prev.cards[prev.cardIndex]?.id ?? null;
        return prev;
      });

      if (!caseId) return;

      setSavingTextAssociation(true);
      const result = await practiceRepository.addTextAssociation(caseId, text);
      setSavingTextAssociation(false);

      if (!result.ok) {
        setState(createPracticeSessionViewStateError(result.error));
        return;
      }

      const updatedCard = PracticeCard.fromDto(result.value);
      setState((prev) => {
        if (!isPracticeSessionReadyViewState(prev)) return prev;
        return createPracticeSessionViewStateWithReplacedCard(prev, updatedCard);
      });
    },
    [practiceRepository],
  );

  return {
    state,
    currentCard,
    visibleAssociations,
    revealAnswer,
    submitGrade,
    addAssociationStub,
    addTextAssociation,
    savingTextAssociation,
  };
}
