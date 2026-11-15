import { useEffect, useState } from "react"
import {
  type AssociationAddAction,
  type AssociationEditorState,
  associationComposeModeForEdit,
  associationKindLabel,
  isEditableAssociation,
} from "@/practice/practice_utils"
import type { PracticeAssociation } from "@/practice/practice_model"
import { usePracticeSessionController } from "@/practice/practice_session_controller"
import { isAssociationContentVisible, isAssociationOnCard } from "@/practice/practice_session_view_state"
import type { PracticeRepository } from "@/practice/practice_repository"
import { AddAssociationDropdownUi } from "@/practice/ui/add_association_dropdown_ui"
import { AddImageUrlAssociationUi } from "@/practice/ui/add_image_url_association_ui"
import { AddTextAssociationUi } from "@/practice/ui/add_text_association_ui"
import { AssociationUi } from "@/practice/ui/associations/association_ui"
import { ConfirmDialogUi } from "@/practice/ui/confirm_dialog_ui"
import { CreateCaseModalUi } from "@/practice/ui/create_case_modal_ui"
import { GradeButtonsUi } from "@/practice/ui/grade_buttons_ui"

type PracticeSessionScreenUiProps = {
  readonly practiceRepository: PracticeRepository
}

type PendingAssociationDelete = {
  readonly associationId: string
  readonly label: string
}

export function PracticeSessionScreenUi({ practiceRepository }: PracticeSessionScreenUiProps) {
  const session = usePracticeSessionController(practiceRepository)
  const [editor, setEditor] = useState<AssociationEditorState | null>(null)
  const [pendingAssociationDelete, setPendingAssociationDelete] = useState<PendingAssociationDelete | null>(null)
  const [pendingCaseDelete, setPendingCaseDelete] = useState(false)
  const [createCaseOpen, setCreateCaseOpen] = useState(false)
  const [editingCase, setEditingCase] = useState(false)
  const [lemmaDraft, setLemmaDraft] = useState("")
  const [meaningDraft, setMeaningDraft] = useState("")

  const saving = session.savingAssociation !== null
  const adding = editor?.intent === "add" && (editor.mode === "text" || editor.mode === "image_url")
  const caseSaving = session.caseBusy !== null && session.caseBusy !== "create"

  useEffect(() => {
    if (!session.currentCard || editingCase) return
    setLemmaDraft(session.currentCard.lemmaText)
    setMeaningDraft(session.currentCard.meaning ?? "")
  }, [session.currentCard, editingCase])

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

  async function confirmAssociationDelete() {
    if (!pendingAssociationDelete) return
    const ok = await session.deleteAssociation(pendingAssociationDelete.associationId)
    if (ok) {
      setPendingAssociationDelete(null)
      setEditor((current) =>
        current?.intent === "edit" && current.associationId === pendingAssociationDelete.associationId
          ? null
          : current,
      )
    }
  }

  function startCaseEdit() {
    const card = session.currentCard
    if (!card) return
    setLemmaDraft(card.lemmaText)
    setMeaningDraft(card.meaning ?? "")
    setEditingCase(true)
    setEditor(null)
  }

  async function saveCaseEdit() {
    const card = session.currentCard
    if (!card) return
    const ok = await session.updateCase(card.id, lemmaDraft, meaningDraft)
    if (ok) setEditingCase(false)
  }

  async function confirmCaseDelete() {
    const card = session.currentCard
    if (!card) return
    const ok = await session.deleteCase(card.id)
    if (ok) {
      setPendingCaseDelete(false)
      setEditingCase(false)
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
        <p className="text-slate-400">Session ended — reload to practice again.</p>
      </main>
    )
  }

  const { cards, cardIndex, phase } = session.state
  const progress = `${cardIndex + 1} / ${cards.length}`
  const onFront = phase === "front"
  const currentCard = session.currentCard
  const editingAssociationId = editor?.intent === "edit" ? editor.associationId : null
  const managing = onFront && (editor === null || editor.intent === "edit") && !adding && !editingCase

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-lg flex-col gap-6 p-6 pb-10">
      <header className="flex items-center justify-between text-sm text-slate-400">
        <span>{currentCard?.languageName}</span>
        <span>{progress}</span>
      </header>

      <section className="flex flex-1 flex-col gap-4 rounded-2xl border border-slate-700/80 bg-card p-5 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-medium text-slate-200">{onFront ? "What's the word?" : "Answer"}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {onFront ? "Use the associations below, then reveal the answer." : "How well did you remember it?"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {editingCase ? (
              <>
                <button
                  type="button"
                  disabled={caseSaving}
                  onClick={() => setEditingCase(false)}
                  className="text-sm text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={caseSaving}
                  onClick={() => void saveCaseEdit()}
                  className="text-sm font-medium text-accent"
                >
                  {caseSaving ? "Saving…" : "Save"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={startCaseEdit}
                  className="text-sm text-slate-400 hover:text-slate-200"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setPendingCaseDelete(true)}
                  className="text-sm text-danger hover:brightness-110"
                >
                  Delete
                </button>
              </>
            )}
            {onFront && editor === null && !editingCase ? (
              <AddAssociationDropdownUi disabled={saving} onPick={handlePickAssociation} />
            ) : null}
          </div>
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

        {editingCase ? (
          <div className="flex flex-col gap-3 rounded-xl border border-slate-600/80 bg-slate-900/40 p-3">
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Lemma
              <input
                value={lemmaDraft}
                disabled={caseSaving}
                onChange={(event) => setLemmaDraft(event.target.value)}
                className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Description
              <textarea
                value={meaningDraft}
                disabled={caseSaving}
                rows={3}
                onChange={(event) => setMeaningDraft(event.target.value)}
                className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </label>
          </div>
        ) : currentCard?.meaning ? (
          <p className="text-sm leading-relaxed text-slate-300">{currentCard.meaning}</p>
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
                    setPendingAssociationDelete({
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

        {!onFront && currentCard && !editingCase ? (
          <div className="rounded-xl border border-accent-soft bg-accent-soft/40 px-4 py-4">
            <p className="text-2xl font-semibold tracking-tight text-white">{currentCard.lemmaText}</p>
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

      <button
        type="button"
        aria-label="Add vocabulary entry"
        onClick={() => setCreateCaseOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-light text-white shadow-lg transition hover:brightness-110"
      >
        +
      </button>

      <CreateCaseModalUi
        open={createCaseOpen}
        saving={session.caseBusy === "create"}
        onCancel={() => setCreateCaseOpen(false)}
        onCreate={(lemma, meaning) => {
          void (async () => {
            const ok = await session.createCase(lemma, meaning)
            if (ok) setCreateCaseOpen(false)
          })()
        }}
      />

      <ConfirmDialogUi
        open={pendingAssociationDelete !== null}
        title="Delete association?"
        message={
          pendingAssociationDelete
            ? `Remove this ${pendingAssociationDelete.label.toLowerCase()} cue from the card? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        confirming={
          pendingAssociationDelete !== null &&
          session.deletingAssociationId === pendingAssociationDelete.associationId
        }
        onCancel={() => setPendingAssociationDelete(null)}
        onConfirm={() => void confirmAssociationDelete()}
      />

      <ConfirmDialogUi
        open={pendingCaseDelete}
        title="Delete this entry?"
        message={
          currentCard
            ? `Remove “${currentCard.lemmaText}” and all its associations from your vocabulary?`
            : ""
        }
        confirmLabel="Delete"
        confirming={currentCard !== null && session.deletingCaseId === currentCard.id}
        onCancel={() => setPendingCaseDelete(false)}
        onConfirm={() => void confirmCaseDelete()}
      />
    </main>
  )
}