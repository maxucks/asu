"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AssociationKind } from "@/core/data_sources/case_data_source";
import type { Result } from "@/core/app_errors";
import type { AssociationComposeMode } from "@/practice/association_add_actions";
import { PracticeError } from "@/practice/practice_errors";
import { PracticeCard } from "@/practice/practice_model";
import type { PracticeGradeDto, PracticeCardDto } from "@/practice/practice_repository";
import { PRACTICE_GRADES } from "@/practice/practice_repository";
import type { PracticeRepository } from "@/practice/practice_repository";
import {
  isAssociationOnCard,
  mergeVisibleAssociations,
  selectCurrentCard,
  selectFrontCaseId,
} from "@/practice/practice_session_selectors";
import {
  createPracticeSessionViewStateAfterGrade,
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
  const [savingAssociation, setSavingAssociation] =
    useState<AssociationComposeMode | null>(null);
  const [deletingAssociationId, setDeletingAssociationId] = useState<string | null>(
    null,
  );
  const stateRef = useRef(state);
  stateRef.current = state;

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

  const currentCard = useMemo(() => selectCurrentCard(state), [state]);

  const revealedHiddenAssociationIds = useMemo(() => {
    if (!isPracticeSessionReadyViewState(state)) return [];
    return state.revealedHiddenAssociationIds;
  }, [state]);

  const visibleAssociations = useMemo(() => {
    if (!currentCard || !isPracticeSessionReadyViewState(state)) return [];
    return mergeVisibleAssociations(currentCard, state.sessionAssociations);
  }, [currentCard, state]);

  const runOnCurrentCard = useCallback(
    async (
      save: (caseId: string) => Promise<Result<PracticeCardDto, PracticeError>>,
    ): Promise<boolean> => {
      const caseId = selectFrontCaseId(stateRef.current);
      if (!caseId) return false;

      const result = await save(caseId);
      if (!result.ok) {
        setState(createPracticeSessionViewStateError(result.error));
        return false;
      }

      const updatedCard = PracticeCard.fromDto(result.value);
      setState((prev) => {
        if (!isPracticeSessionReadyViewState(prev)) return prev;
        return createPracticeSessionViewStateWithReplacedCard(prev, updatedCard);
      });
      return true;
    },
    [],
  );

  const mutateOnCurrentCard = useCallback(
    async (
      mode: AssociationComposeMode,
      save: (caseId: string) => Promise<Result<PracticeCardDto, PracticeError>>,
    ): Promise<boolean> => {
      setSavingAssociation(mode);
      const ok = await runOnCurrentCard(save);
      setSavingAssociation(null);
      return ok;
    },
    [runOnCurrentCard],
  );

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

  const toggleRevealHiddenAssociation = useCallback((associationId: string) => {
    setState((prev) => {
      if (!isPracticeSessionReadyViewState(prev)) return prev;
      return createPracticeSessionViewStateWithToggledRevealedHidden(prev, associationId);
    });
  }, []);

  const addSessionAssociation = useCallback(
    (kind: AssociationKind, contentRef?: string) => {
      setState((prev) => {
        if (!isPracticeSessionReadyViewState(prev)) return prev;

        const association = createSessionAssociation(prev, kind, contentRef);
        if (!association) return prev;

        return createPracticeSessionViewStateWithAssociation(prev, association);
      });
    },
    [],
  );

  const setAssociationHidden = useCallback(
    async (associationId: string, hiddenFromPractice: boolean) => {
      if (!currentCard) return false;

      if (isAssociationOnCard(currentCard, associationId)) {
        const ok = await runOnCurrentCard((caseId) =>
          practiceRepository.setAssociationHiddenFromPractice(
            caseId,
            associationId,
            hiddenFromPractice,
          ),
        );
        if (!ok) return false;

        if (hiddenFromPractice) {
          setState((prev) => {
            if (!isPracticeSessionReadyViewState(prev)) return prev;
            const revealed = prev.revealedHiddenAssociationIds.filter(
              (id) => id !== associationId,
            );
            return createPracticeSessionViewStateReady(
              prev.cards,
              prev.cardIndex,
              prev.phase,
              prev.sessionAssociations,
              revealed,
            );
          });
        }
        return true;
      }

      setState((prev) => {
        if (!isPracticeSessionReadyViewState(prev)) return prev;
        const revealed = hiddenFromPractice
          ? prev.revealedHiddenAssociationIds.filter((id) => id !== associationId)
          : prev.revealedHiddenAssociationIds;
        const patched = createPracticeSessionViewStateWithSessionAssociationPatched(
          prev,
          associationId,
          (item) => item.withHiddenFromPractice(hiddenFromPractice),
        );
        return createPracticeSessionViewStateReady(
          patched.cards,
          patched.cardIndex,
          patched.phase,
          patched.sessionAssociations,
          revealed,
        );
      });
      return true;
    },
    [currentCard, practiceRepository, runOnCurrentCard],
  );

  const deleteAssociation = useCallback(
    async (associationId: string) => {
      if (!currentCard) return false;

      setDeletingAssociationId(associationId);

      let ok = false;
      if (isAssociationOnCard(currentCard, associationId)) {
        ok = await runOnCurrentCard((caseId) =>
          practiceRepository.deleteAssociation(caseId, associationId),
        );
      } else {
        setState((prev) => {
          if (!isPracticeSessionReadyViewState(prev)) return prev;
          return createPracticeSessionViewStateWithoutSessionAssociation(
            prev,
            associationId,
          );
        });
        ok = true;
      }

      setDeletingAssociationId(null);
      return ok;
    },
    [currentCard, practiceRepository, runOnCurrentCard],
  );

  const addTextAssociation = useCallback(
    async (text: string) =>
      mutateOnCurrentCard("text", (caseId) =>
        practiceRepository.addTextAssociation(caseId, text),
      ),
    [mutateOnCurrentCard, practiceRepository],
  );

  const addImageAssociationFromUrl = useCallback(
    async (url: string) =>
      mutateOnCurrentCard("image_url", (caseId) =>
        practiceRepository.addImageAssociationFromUrl(caseId, url),
      ),
    [mutateOnCurrentCard, practiceRepository],
  );

  const updateTextAssociation = useCallback(
    async (associationId: string, text: string) =>
      mutateOnCurrentCard("text", (caseId) =>
        practiceRepository.updateTextAssociation(caseId, associationId, text),
      ),
    [mutateOnCurrentCard, practiceRepository],
  );

  const updateImageAssociationFromUrl = useCallback(
    async (associationId: string, url: string) =>
      mutateOnCurrentCard("image_url", (caseId) =>
        practiceRepository.updateImageAssociationFromUrl(caseId, associationId, url),
      ),
    [mutateOnCurrentCard, practiceRepository],
  );

  const sessionPhase = isPracticeSessionReadyViewState(state) ? state.phase : null;

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
    savingAssociation,
    deletingAssociationId,
  };
}
