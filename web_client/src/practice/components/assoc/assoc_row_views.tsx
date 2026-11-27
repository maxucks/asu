import { AssocTextFormLayout } from "@/practice/components/assoc/text_form_layout"
import { AssocUrlFormLayout } from "@/practice/components/assoc/url_form_layout"
import type { PracticeAssociation } from "@/practice/practice_model"
import type { ReactNode } from "react"

export type AssociationEditViewsHandlers = {
  readonly textSaving: boolean
  readonly imageUrlSaving: boolean
  readonly onCancelEdit: () => void
  readonly onSaveTextEdit: (
    associationId: string,
    payload: { readonly text: string; readonly tileColor: string | null },
  ) => void
  readonly onSaveImageUrlEdit: (associationId: string, url: string) => void
}

export function associationEditViews(
  association: PracticeAssociation,
  handlers: AssociationEditViewsHandlers,
): { readonly textEdit: ReactNode; readonly urlEdit: ReactNode } {
  return {
    textEdit: (
      <AssocTextFormLayout
        intent="edit"
        initialValue={association.contentRef}
        initialTileColor={association.tileColor}
        saving={handlers.textSaving}
        onCancel={handlers.onCancelEdit}
        onSave={(payload) => handlers.onSaveTextEdit(association.id, payload)}
      />
    ),
    urlEdit: (
      <AssocUrlFormLayout
        intent="edit"
        initialValue={association.contentRef}
        saving={handlers.imageUrlSaving}
        onCancel={handlers.onCancelEdit}
        onSave={(url) => handlers.onSaveImageUrlEdit(association.id, url)}
      />
    ),
  }
}

export type AssociationAddViewsHandlers = {
  readonly textSaving: boolean
  readonly imageUrlSaving: boolean
  readonly onCancelAdd: () => void
  readonly onSaveAddText: (payload: { readonly text: string; readonly tileColor: string | null }) => void
  readonly onSaveAddImageUrl: (url: string) => void
}

export function associationAddTextView(handlers: AssociationAddViewsHandlers): ReactNode {
  return (
    <AssocTextFormLayout
      saving={handlers.textSaving}
      onCancel={handlers.onCancelAdd}
      onSave={(payload) => handlers.onSaveAddText(payload)}
    />
  )
}

export function associationAddImageUrlView(handlers: AssociationAddViewsHandlers): ReactNode {
  return (
    <AssocUrlFormLayout
      saving={handlers.imageUrlSaving}
      onCancel={handlers.onCancelAdd}
      onSave={(url) => handlers.onSaveAddImageUrl(url)}
    />
  )
}