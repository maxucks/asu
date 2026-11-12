"use client";

import { useState } from "react";
import type { AssociationKind } from "@/core/data_sources/case_data_source";
import { usePracticeSessionController } from "@/practice/practice_session_controller";
import type { PracticeRepository } from "@/practice/practice_repository";
import { AddAssociationDropdownUi } from "@/practice/ui/add_association_dropdown_ui";
import { AddTextAssociationUi } from "@/practice/ui/add_text_association_ui";
import { AssociationStubUi } from "@/practice/ui/associations/association_stub_ui";
import { GradeButtonsUi } from "@/practice/ui/grade_buttons_ui";

type PracticeSessionScreenUiProps = {
  readonly practiceRepository: PracticeRepository;
};

export function PracticeSessionScreenUi({
  practiceRepository,
}: PracticeSessionScreenUiProps) {
  const {
    state,
    currentCard,
    visibleAssociations,
    revealAnswer,
    submitGrade,
    addAssociationStub,
    addTextAssociation,
    savingTextAssociation,
  } = usePracticeSessionController(practiceRepository);

  const [composingText, setComposingText] = useState(false);

  function handlePickAssociationKind(kind: AssociationKind) {
    if (kind === "text") {
      setComposingText(true);
      return;
    }
    addAssociationStub(kind);
  }

  if (state.status === "loading") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg items-center justify-center p-6">
        <p className="text-slate-400">Loading practice queue…</p>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-[var(--danger)]">{state.error.message}</p>
        <p className="text-xs uppercase tracking-wider text-slate-500">
          {state.error.code}
        </p>
      </main>
    );
  }

  if (state.status === "finished") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-100">Queue complete</h1>
        <p className="text-slate-400">Mock session ended — reload to try again.</p>
      </main>
    );
  }

  const progress = `${state.cardIndex + 1} / ${state.cards.length}`;
  const onFront = state.phase === "front";

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 p-6 pb-10">
      <header className="flex items-center justify-between text-sm text-slate-400">
        <span>{currentCard?.languageName}</span>
        <span>{progress}</span>
      </header>

      <section className="flex flex-1 flex-col gap-4 rounded-2xl border border-slate-700/80 bg-[var(--card)] p-5 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-medium text-slate-200">
              {onFront ? "What's the word?" : "Answer"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {onFront
                ? "Use the associations below, then reveal the answer."
                : "How well did you remember it?"}
            </p>
          </div>
          {onFront && !composingText ? (
            <AddAssociationDropdownUi onPick={handlePickAssociationKind} />
          ) : null}
        </div>

        {onFront && composingText ? (
          <AddTextAssociationUi
            saving={savingTextAssociation}
            onCancel={() => setComposingText(false)}
            onSave={(text) => {
              void addTextAssociation(text).then(() => setComposingText(false));
            }}
          />
        ) : null}

        <div className="space-y-3">
          {visibleAssociations.map((assoc) => (
            <AssociationStubUi key={assoc.id} association={assoc} />
          ))}
        </div>

        {!onFront && currentCard ? (
          <div className="rounded-xl border border-[var(--accent-soft)] bg-[var(--accent-soft)]/40 px-4 py-4">
            <p className="text-2xl font-semibold tracking-tight text-white">
              {currentCard.lemmaText}
            </p>
            {currentCard.translation ? (
              <p className="mt-2 text-sm text-slate-300">{currentCard.translation}</p>
            ) : null}
          </div>
        ) : null}
      </section>

      <footer className="mt-auto">
        {onFront ? (
          <button
            type="button"
            onClick={revealAnswer}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-3.5 text-base font-semibold text-white transition hover:brightness-110"
          >
            Show answer
          </button>
        ) : (
          <GradeButtonsUi onGrade={submitGrade} />
        )}
      </footer>
    </main>
  );
}
