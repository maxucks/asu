import type { PracticeAssociation } from "@/practice/practice_model"
import { isAssociationOnCard } from "@/practice/practice_session_view_state"
import type { CaseDetailController } from "@/practice/hooks/use_case_detail_controller"
import {
  type AssociationAddAction,
  type AssociationEditorState,
  associationComposeModeForEdit,
  isEditableAssociation,
} from "@/practice/practice_utils"
import { useEffect, useState } from "react"

export function useCaseDetailUi(detail: CaseDetailController) {
  const [editor, setEditor] = useState<AssociationEditorState | null>(null)
  const [pendingAssocDelete, setPendingAssocDelete] = useState<{ readonly id: string; readonly label: string } | null>(
    null,
  )
  const [pendingCaseDelete, setPendingCaseDelete] = useState(false)
  const [editingCase, setEditingCase] = useState(false)
  const [lemmaDraft, setLemmaDraft] = useState("")
  const [meaningDraft, setMeaningDraft] = useState("")

  const saving = detail.savingAssociation !== null
  const adding = editor?.intent === "add" && (editor.mode === "text" || editor.mode === "image_url")
  const caseSaving = detail.caseBusy === "update"

  useEffect(() => {
    if (editingCase) return
    setLemmaDraft(detail.card.lemmaText)
    setMeaningDraft(detail.card.meaning ?? "")
  }, [detail.card, editingCase])

  function pickAssoc(action: AssociationAddAction) {
    switch (action.action) {
      case "text":
        setEditor({ intent: "add", mode: "text" })
        return
      case "image_url":
        setEditor({ intent: "add", mode: "image_url" })
        return
      case "image_stub":
      case "kind_stub":
        return
    }
  }

  function startAssocEdit(association: PracticeAssociation) {
    const card = detail.card
    if (!isAssociationOnCard(card, association.id) || !isEditableAssociation(association)) return

    const mode = associationComposeModeForEdit(association)
    if (!mode) return

    if (association.hiddenFromPractice && !detail.revealedHiddenAssociationIds.includes(association.id)) {
      detail.toggleRevealHiddenAssociation(association.id)
    }

    setEditor({ intent: "edit", mode, associationId: association.id })
  }

  async function saveEditor(save: () => Promise<boolean>) {
    if (await save()) setEditor(null)
  }

  async function confirmAssocDelete() {
    if (!pendingAssocDelete) return
    const ok = await detail.deleteAssociation(pendingAssocDelete.id)
    if (!ok) return
    setPendingAssocDelete(null)
    setEditor((current) =>
      current?.intent === "edit" && current.associationId === pendingAssocDelete.id ? null : current,
    )
  }

  function startCaseEdit() {
    setLemmaDraft(detail.card.lemmaText)
    setMeaningDraft(detail.card.meaning ?? "")
    setEditingCase(true)
    setEditor(null)
  }

  async function saveCaseEdit() {
    if (await detail.updateCase(lemmaDraft, meaningDraft)) setEditingCase(false)
  }

  async function confirmCaseDelete() {
    if (await detail.deleteCase()) {
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
    editingCase,
    setEditingCase,
    lemmaDraft,
    setLemmaDraft,
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