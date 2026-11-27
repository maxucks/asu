import { assocLibraryFlags } from "@/practice/assoc_flags"
import type { AssocRow } from "@/practice/components/assoc/list_layout"
import { AssocTextFormLayout } from "@/practice/components/assoc/text_form_layout"
import { AssocUrlFormLayout } from "@/practice/components/assoc/url_form_layout"
import { CaseCategoryField } from "@/practice/components/category/case_category_field"
import type { CaseLibraryDetailTab } from "@/practice/components/case_library/case_library_detail_tab_bar"
import { CaseLibraryDetailLayout } from "@/practice/components/case_library/case_library_detail_layout"
import { CaseNoteAttachField } from "@/practice/components/notes/case_note_attach_field"
import { ConfirmBox } from "@/practice/components/session/confirm_box"
import { useCaseDetailController } from "@/practice/hooks/use_case_detail_controller"
import { useCaseDetailUi } from "@/practice/hooks/use_case_detail_ui"
import { useLanguageNotes } from "@/practice/hooks/use_language_notes"
import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import type { CategoryDto, PracticeCardDto, PracticeRepository } from "@/practice/practice_repository"
import { associationKindLabel } from "@/practice/practice_utils"
import { useCallback, useEffect, useState } from "react"

type CaseLibraryDetailProps = {
  readonly card: PracticeCardDto
  readonly languageId: string
  readonly categories: readonly CategoryDto[]
  readonly repo: PracticeRepository
  readonly onCardChange: (card: PracticeCardDto) => void
  readonly onDeleted: () => void
  readonly onCategoriesMetaChange: () => void
  readonly representationTypes: readonly RepresentationTypeDto[]
  readonly onOpenLinkedNote?: (noteId: string) => void
}

export function CaseLibraryDetail({
  card,
  languageId,
  categories,
  repo,
  onCardChange,
  onDeleted,
  onCategoriesMetaChange,
  representationTypes,
  onOpenLinkedNote,
}: CaseLibraryDetailProps) {
  const detail = useCaseDetailController(repo, card, onCardChange, onDeleted)
  const ui = useCaseDetailUi(detail, representationTypes)
  const { notes: languageNotes, refresh: refreshLanguageNotes } = useLanguageNotes(repo, languageId)
  const [detailTab, setDetailTab] = useState<CaseLibraryDetailTab>("entry")
  const [noteAttachBusy, setNoteAttachBusy] = useState(false)

  useEffect(() => {
    setDetailTab("entry")
  }, [card.id])

  useEffect(() => {
    if (ui.editingCase && detailTab === "notes") setDetailTab("entry")
  }, [detailTab, ui.editingCase])

  const handleAttachNote = useCallback(
    async (noteId: string) => {
      setNoteAttachBusy(true)
      const result = await repo.linkCaseNote(card.id, { noteId })
      setNoteAttachBusy(false)
      if (!result.ok) return false
      onCardChange(result.value)
      await refreshLanguageNotes()
      return true
    },
    [card.id, onCardChange, refreshLanguageNotes, repo],
  )

  const handleCreateAndAttachNote = useCallback(
    async (name: string, content: string) => {
      setNoteAttachBusy(true)
      const result = await repo.linkCaseNote(card.id, { name, content })
      setNoteAttachBusy(false)
      if (!result.ok) return false
      onCardChange(result.value)
      await refreshLanguageNotes()
      return true
    },
    [card.id, onCardChange, refreshLanguageNotes, repo],
  )

  const handleDetachNote = useCallback(
    async (noteId: string) => {
      setNoteAttachBusy(true)
      const result = await repo.unlinkCaseNote(card.id, noteId)
      setNoteAttachBusy(false)
      if (!result.ok) return false
      onCardChange(result.value)
      await refreshLanguageNotes()
      return true
    },
    [card.id, onCardChange, refreshLanguageNotes, repo],
  )

  const showAdd = ui.editor === null && !ui.editingCase
  const associationSortable = showAdd && !ui.editingCase

  const rows: AssocRow[] = detail.card.associations.map((association) => {
    const flags = assocLibraryFlags(association, ui.editor, detail.revealedHiddenAssociationIds)
    return {
      association,
      sortable: true,
      flags,
      onEdit: () => ui.startAssocEdit(association),
      onHide: () => void detail.setAssociationHidden(association.id, true),
      onUnhide: () => void detail.setAssociationHidden(association.id, false),
      onDelete: () => ui.setPendingAssocDelete({ id: association.id, label: associationKindLabel(association.kind) }),
      onReveal: () => detail.toggleRevealHiddenAssociation(association.id),
      textEdit: (
        <AssocTextFormLayout
          intent="edit"
          initialValue={association.contentRef}
          initialTileColor={association.tileColor}
          saving={detail.savingAssociation === "text"}
          onCancel={() => ui.setEditor(null)}
          onSave={(payload) =>
            void ui.saveEditor(() =>
              detail.updateTextAssociation(association.id, payload.text, payload.tileColor),
            )
          }
        />
      ),
      urlEdit: (
        <AssocUrlFormLayout
          intent="edit"
          initialValue={association.contentRef}
          saving={detail.savingAssociation === "image_url"}
          onCancel={() => ui.setEditor(null)}
          onSave={(url) => void ui.saveEditor(() => detail.updateImageAssociationFromUrl(association.id, url))}
        />
      ),
    }
  })

  const addText =
    ui.editor?.intent === "add" && ui.editor.mode === "text" ? (
      <AssocTextFormLayout
        saving={detail.savingAssociation === "text"}
        onCancel={() => ui.setEditor(null)}
        onSave={(payload) =>
          void ui.saveEditor(() => detail.addTextAssociation(payload.text, payload.tileColor))
        }
      />
    ) : null

  const addUrl =
    ui.editor?.intent === "add" && ui.editor.mode === "image_url" ? (
      <AssocUrlFormLayout
        saving={detail.savingAssociation === "image_url"}
        onCancel={() => ui.setEditor(null)}
        onSave={(url) => void ui.saveEditor(() => detail.addImageAssociationFromUrl(url))}
      />
    ) : null

  const notesPanel =
    !ui.editingCase ? (
      <CaseNoteAttachField
        notes={detail.card.notes}
        languageNotes={languageNotes}
        disabled={ui.saving || noteAttachBusy || detail.categoriesBusy}
        attaching={noteAttachBusy}
        onOpenNote={(noteId) => onOpenLinkedNote?.(noteId)}
        onAttach={handleAttachNote}
        onCreateAndAttach={handleCreateAndAttachNote}
        onDetach={handleDetachNote}
      />
    ) : (
      <p className="text-sm text-muted">Finish editing the entry to manage notes.</p>
    )

  return (
    <aside className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
        <CaseLibraryDetailLayout
          caseTitle={detail.card.value}
          representations={detail.card.representations}
          editingCase={ui.editingCase}
          caseSaving={ui.caseSaving}
          showAdd={showAdd}
          saving={ui.saving}
          value={ui.valueDraft}
          meaning={ui.meaningDraft}
          cardMeaning={detail.card.meaning ?? undefined}
          rows={rows}
          addText={addText}
          addUrl={addUrl}
          onValue={ui.setValueDraft}
          onMeaning={ui.setMeaningDraft}
          representationTypes={representationTypes}
          representationDrafts={ui.representationDrafts}
          onRepresentationDraft={ui.setRepresentationDraft}
          onCancelCase={() => ui.setEditingCase(false)}
          onSaveCase={() => void ui.saveCaseEdit()}
          onEditCase={ui.startCaseEdit}
          onDeleteCase={() => ui.setPendingCaseDelete(true)}
          onPick={ui.pickAssoc}
          sortable={associationSortable}
          onReorder={(ids) => void detail.reorderAssociations(ids)}
          tab={detailTab}
          onTab={setDetailTab}
          notesCount={detail.card.notes.length}
          notesPanel={notesPanel}
          caseCategories={
            !ui.editingCase ? (
              <CaseCategoryField
                categories={categories}
                value={detail.card.categories}
                disabled={ui.saving || detail.categoriesBusy}
                onCreateCategory={async (name) => {
                  const result = await repo.createCategory(languageId, name)
                  if (!result.ok) return null
                  onCategoriesMetaChange()
                  return result.value
                }}
                onChange={(ids) =>
                  void detail.setCaseCategories(ids).then((ok) => {
                    if (ok) onCategoriesMetaChange()
                  })
                }
              />
            ) : null
          }
        />
      </div>
      <ConfirmBox
        open={ui.pendingAssocDelete !== null}
        title="Delete association?"
        message={ui.pendingAssocDelete ? `Remove this ${ui.pendingAssocDelete.label.toLowerCase()} cue?` : ""}
        confirmLabel="Delete"
        busy={ui.pendingAssocDelete !== null && detail.deletingAssociationId === ui.pendingAssocDelete.id}
        onCancel={() => ui.setPendingAssocDelete(null)}
        onConfirm={() => void ui.confirmAssocDelete()}
      />
      <ConfirmBox
        open={ui.pendingCaseDelete}
        title="Delete entry?"
        message={`Remove “${detail.card.value}” and all its associations?`}
        confirmLabel="Delete"
        busy={detail.caseBusy === "delete"}
        onCancel={() => ui.setPendingCaseDelete(false)}
        onConfirm={() => void ui.confirmCaseDelete()}
      />
    </aside>
  )
}