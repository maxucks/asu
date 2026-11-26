import type { PracticeAssociation } from "@/practice/practice_model"
import type { usePracticeSessionController } from "@/practice/practice_session_controller"
import { isAssociationOnCard } from "@/practice/practice_session_view_state"
import {
  type AssociationAddAction,
  type AssociationEditorState,
  associationComposeModeForEdit,
  isEditableAssociation,
} from "@/practice/practice_utils"
import { useEffect, useState } from "react"

type Session = ReturnType<typeof usePracticeSessionController>

type PendingAssocDelete = { readonly id: string; readonly label: string }

export function useSessionUi(session: Session) {
  const [editor, setEditor] = useState<AssociationEditorState | null>(null)
  const [pendingAssocDelete, setPendingAssocDelete] = useState<PendingAssocDelete | null>(null)
  const [pendingCaseDelete, setPendingCaseDelete] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingCase, setEditingCase] = useState(false)
  const [valueDraft, setValueDraft] = useState("")
  const [meaningDraft, setMeaningDraft] = useState("")

  const saving = session.savingAssociation !== null || session.reorderingAssociations
  const adding = editor?.intent === "add" && (editor.mode === "text" || editor.mode === "image_url")
  const caseSaving = session.caseBusy !== null && session.caseBusy !== "create"

  useEffect(() => {
    if (!session.currentCard || editingCase) return
    setValueDraft(session.currentCard.value)
    setMeaningDraft(session.currentCard.meaning ?? "")
  }, [session.currentCard, editingCase])

  function pickAssoc(action: AssociationAddAction) {
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

  function startAssocEdit(association: PracticeAssociation) {
    const card = session.currentCard
    if (!card || !isAssociationOnCard(card, association.id) || !isEditableAssociation(association)) return

    const mode = associationComposeModeForEdit(association)
    if (!mode) return

    if (
      association.hiddenFromPractice &&
      session.sessionPhase === "front" &&
      !session.revealedHiddenAssociationIds.includes(association.id)
    ) {
      session.toggleRevealHiddenAssociation(association.id)
    }

    setEditor({ intent: "edit", mode, associationId: association.id })
  }

  async function saveEditor(save: () => Promise<boolean>) {
    if (await save()) setEditor(null)
  }

  async function confirmAssocDelete() {
    if (!pendingAssocDelete) return
    const ok = await session.deleteAssociation(pendingAssocDelete.id)
    if (!ok) return
    setPendingAssocDelete(null)
    setEditor((current) =>
      current?.intent === "edit" && current.associationId === pendingAssocDelete.id ? null : current,
    )
  }

  function startCaseEdit() {
    const card = session.currentCard
    if (!card) return
    setValueDraft(card.value)
    setMeaningDraft(card.meaning ?? "")
    setEditingCase(true)
    setEditor(null)
  }

  async function saveCaseEdit() {
    const card = session.currentCard
    if (!card) return
    if (await session.updateCase(card.id, valueDraft, meaningDraft)) setEditingCase(false)
  }

  async function confirmCaseDelete() {
    const card = session.currentCard
    if (!card) return
    if (await session.deleteCase(card.id)) {
      setPendingCaseDelete(false)
      setEditingCase(false)
    }
  }

  return {
    editor,
    setEditor,
    pendingAssocDelete,
    setPendingAssocDelete,
    pendingCaseDelete,
    setPendingCaseDelete,
    createOpen,
    setCreateOpen,
    editingCase,
    setEditingCase,
    valueDraft,
    setValueDraft,
    meaningDraft,
    setMeaningDraft,
    saving,
    adding,
    caseSaving,
    pickAssoc,
    startAssocEdit,
    saveEditor,
    confirmAssocDelete,
    startCaseEdit,
    saveCaseEdit,
    confirmCaseDelete,
  }
}