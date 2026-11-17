import type { PracticeAssociation } from "@/practice/practice_model"
import type { usePracticeSessionController } from "@/practice/practice_session_controller"
import { isAssociationContentVisible, isAssociationOnCard } from "@/practice/practice_session_view_state"
import {
  type AssociationEditorState,
  associationComposeModeForEdit,
  isEditableAssociation,
} from "@/practice/practice_utils"

type Session = ReturnType<typeof usePracticeSessionController>

export type AssocFlags = {
  readonly editing: boolean
  readonly compose: "text" | "image_url" | null
  readonly visible: boolean
  readonly canEdit: boolean
  readonly canHide: boolean
  readonly canUnhide: boolean
  readonly canDelete: boolean
}

export function assocLibraryFlags(
  association: PracticeAssociation,
  editor: AssociationEditorState | null,
  revealedHiddenAssociationIds: readonly string[],
): AssocFlags {
  const editing = editor?.intent === "edit" && editor.associationId === association.id
  const canManage = !editing
  const visible =
    !association.hiddenFromPractice || revealedHiddenAssociationIds.includes(association.id)

  return {
    editing,
    compose: editing ? associationComposeModeForEdit(association) : null,
    visible,
    canEdit: canManage && isEditableAssociation(association),
    canHide: canManage && !association.hiddenFromPractice,
    canUnhide: canManage && association.hiddenFromPractice,
    canDelete: canManage,
  }
}

export function assocFlags(
  association: PracticeAssociation,
  session: Session,
  editor: AssociationEditorState | null,
  phase: "front" | "back",
  managing: boolean,
): AssocFlags {
  const card = session.currentCard
  const onCard = card ? isAssociationOnCard(card, association.id) : false
  const editing = editor?.intent === "edit" && editor.associationId === association.id
  const canManage = managing && !editing
  const canEdit = canManage && onCard && isEditableAssociation(association)

  return {
    editing,
    compose: editing ? associationComposeModeForEdit(association) : null,
    visible: isAssociationContentVisible(association, phase, session.revealedHiddenAssociationIds),
    canEdit,
    canHide: canManage && !association.hiddenFromPractice,
    canUnhide: canManage && association.hiddenFromPractice,
    canDelete: canManage,
  }
}