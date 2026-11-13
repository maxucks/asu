import { useState } from "react"
import {
  type AssociationAddAction,
  type AssociationEditorState,
  associationComposeModeForEdit,
  associationKindLabel,
  isEditableAssociation,
} from "@/practice/practice_association"
import type { PracticeAssociation } from "@/practice/practice_model"
import { usePracticeSessionController } from "@/practice/practice_session_controller"
import { isAssociationContentVisible, isAssociationOnCard } from "@/practice/practice_session_view_state"
import type { PracticeRepository } from "@/practice/practice_repository"
import { AddAssociationDropdownUi } from "@/practice/ui/add_association_dropdown_ui"
import { AddImageUrlAssociationUi } from "@/practice/ui/add_image_url_association_ui"
import { AddTextAssociationUi } from "@/practice/ui/add_text_association_ui"
import { AssociationUi } from "@/practice/ui/associations/association_ui"
import { ConfirmDialogUi } from "@/practice/ui/confirm_dialog_ui"
import { GradeButtonsUi } from "@/practice/ui/grade_buttons_ui"

type PracticeSessionScreenUiProps = {
  readonly practiceRepository: PracticeRepository
}

type PendingDelete = {
  readonly associationId: string
  readonly label: string
}

export function PracticeSessionScreenUi({ practiceRepository }: PracticeSessionScreenUiProps) {
  const session = usePracticeSessionController(practiceRepository)
  const [editor, setEditor] = useState<AssociationEditorState | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)

  const saving = session.savingAssociation !== null
  const adding = editor?.intent === "add" && (editor.mode === "text" || editor.mode === "image_url")

  function handlePickAssociation(action: AssociationAddAction) {
    switch (action.action) {
      case "text":
        setEditor({ intent: "add", mode: "text" })
        return
      case "image_url":
        setEditor({ intent: "add", mode: "image_url" })
        return
      case "image_stub":
        session.addSessionAssociation("image", action.contentRef)
        return
      case "kind_stub":
        session.addSessionAssociation(action.kind)
        return
    }
  }

  function startEdit(associationId: string) {
    const association = session.visibleAssociations.find((item) => item.id === associationId)
    if (!association || !isEditableAssociation(association)) return

    const card = session.currentCard
    if (!card || !isAssociationOnCard(card, associationId)) return

    const mode = associationComposeModeForEdit(association)
    if (!mode) return

    if (
      association.hiddenFromPractice &&
      session.sessionPhase === "front" &&
      !session.revealedHiddenAssociationIds.includes(associationId)
    ) {
      session.toggleRevealHiddenAssociation(associationId)
    }

    setEditor({ intent: "edit", mode, associationId })
  }

  async function closeEditorOnSuccess(save: () => Promise<boolean>) {
    const ok = await save()
    if (ok) setEditor(null)
  }

  function deleteLabel(association: PracticeAssociation): string {
    return associationKindLabel(association.kind)
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    const ok = await session.deleteAssociation(pendingDelete.associationId)
    if (ok) {
      setPendingDelete(null)
      setEditor((current) =>
        current?.intent === "edit" && current.associationId === pendingDelete.associationId ? null : current,
      )
    }
  }

  if (session.state.status === "loading") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg items-center justify-center p-6">
        <p className="text-slate-400">Loading practice queue…</p>
      </main>
    )
  }

  if (session.state.status === "error") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-danger">{session.state.error.message}</p>
        <p className="text-xs uppercase tracking-wider text-slate-500">{session.state.error.code}</p>
      </main>
    )
  }

  if (session.state.status === "finished") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-100">Queue complete</h1>
        <p className="text-slate-400">Mock session ended — reload to try again.</p>
      </main>
    )
  }

  const { cards, cardIndex, phase } = session.state
  const progress = `${cardIndex + 1} / ${cards.length}`
  const onFront = phase === "front"
  const currentCard = session.currentCard
  const editingAssociationId = editor?.intent === "edit" ? editor.associationId : null
  const managing = onFront && (editor === null || editor.intent === "edit") && !adding

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 p-6 pb-10">
      <header className="flex items-center justify-between text-sm text-slate-400">
        <span>{currentCard?.languageName}</span>
        <span>{progress}</span>
      </header>

      <section className="flex flex-1 flex-col gap-4 rounded-2xl border border-slate-700/80 bg-card p-5 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-medium text-slate-200">{onFront ? "What's the word?" : "Answer"}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {onFront ? "Use the associations below, then reveal the answer." : "How well did you remember it?"}
            </p>
          </div>
          {onFront && editor === null ? (
            <AddAssociationDropdownUi disabled={saving} onPick={handlePickAssociation} />
          ) : null}
        </div>

        {onFront && editor?.intent === "add" && editor.mode === "text" ? (
          <AddTextAssociationUi
            saving={session.savingAssociation === "text"}
            onCancel={() => setEditor(null)}
            onSave={(text) => void closeEditorOnSuccess(() => session.addTextAssociation(text))}
          />
        ) : null}

        {onFront && editor?.intent === "add" && editor.mode === "image_url" ? (
          <AddImageUrlAssociationUi
            saving={session.savingAssociation === "image_url"}
            onCancel={() => setEditor(null)}
            onSave={(url) => void closeEditorOnSuccess(() => session.addImageAssociationFromUrl(url))}
          />
        ) : null}

        {currentCard?.translation ? (
          <p className="text-sm leading-relaxed text-slate-300">
            {currentCard.translation}
          </p>
        ) : null}

        <h2 className="sr-only">Associations</h2>
        <ul className="space-y-3">
          {session.visibleAssociations.map((association) => {
            const editingThis = editor?.intent === "edit" && editor.associationId === association.id
            const composeMode = associationComposeModeForEdit(association)
            const onCard = currentCard ? isAssociationOnCard(currentCard, association.id) : false
            const contentVisible = isAssociationContentVisible(association, phase, session.revealedHiddenAssociationIds)
            const canManage = managing && editingAssociationId !== association.id
            const canEdit = canManage && onCard && isEditableAssociation(association)

            if (editingThis && composeMode === "text") {
              return (
                <li key={association.id}>
                  <AddTextAssociationUi
                    key={association.id}
                    intent="edit"
                    initialValue={association.contentRef}
                    saving={session.savingAssociation === "text"}
                    onCancel={() => setEditor(null)}
                    onSave={(text) =>
                      void closeEditorOnSuccess(() => session.updateTextAssociation(association.id, text))
                    }
                  />
                </li>
              )
            }

            if (editingThis && composeMode === "image_url") {
              return (
                <li key={association.id}>
                  <AddImageUrlAssociationUi
                    key={association.id}
                    intent="edit"
                    initialValue={association.contentRef}
                    saving={session.savingAssociation === "image_url"}
                    onCancel={() => setEditor(null)}
                    onSave={(url) =>
                      void closeEditorOnSuccess(() => session.updateImageAssociationFromUrl(association.id, url))
                    }
                  />
                </li>
              )
            }

            return (
              <li key={association.id}>
                <AssociationUi
                  association={association}
                  contentVisible={contentVisible}
                  canEdit={canEdit}
                  canHide={canManage && !association.hiddenFromPractice}
                  canUnhide={canManage && association.hiddenFromPractice}
                  canDelete={canManage}
                  onEdit={() => startEdit(association.id)}
                  onHide={() => void session.setAssociationHidden(association.id, true)}
                  onUnhide={() => void session.setAssociationHidden(association.id, false)}
                  onDelete={() =>
                    setPendingDelete({
                      associationId: association.id,
                      label: deleteLabel(association),
                    })
                  }
                  onRevealHidden={() => session.toggleRevealHiddenAssociation(association.id)}
                />
              </li>
            )
          })}
        </ul>

        {!onFront && currentCard ? (
          <div className="rounded-xl border border-accent-soft bg-accent-soft/40 px-4 py-4">
            <p className="text-2xl font-semibold tracking-tight text-white">
              {currentCard.lemmaText}
            </p>
          </div>
        ) : null}
      </section>

      <footer className="mt-auto">
        {onFront ? (
          <button
            type="button"
            onClick={session.revealAnswer}
            className="w-full rounded-xl bg-accent px-4 py-3.5 text-base font-semibold text-white transition hover:brightness-110"
          >
            Show answer
          </button>
        ) : (
          <GradeButtonsUi onGrade={session.submitGrade} />
        )}
      </footer>

      <ConfirmDialogUi
        open={pendingDelete !== null}
        title="Delete association?"
        message={
          pendingDelete
            ? `Remove this ${pendingDelete.label.toLowerCase()} cue from the card? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        confirming={pendingDelete !== null && session.deletingAssociationId === pendingDelete.associationId}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </main>
  )
}
