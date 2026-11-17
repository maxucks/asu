import { assocFlags } from "@/practice/assoc_flags"
import { CaseLibraryDrawer } from "@/practice/components/case_library/case_library_drawer"
import { LanguageSwitchModal } from "@/practice/components/language/language_switch_modal"
import type { AssocRow } from "@/practice/components/assoc/list_layout"
import { AssocTextFormLayout } from "@/practice/components/assoc/text_form_layout"
import { AssocUrlFormLayout } from "@/practice/components/assoc/url_form_layout"
import { OverlaysLayout } from "@/practice/components/session/overlays_layout"
import { HeaderLayout } from "@/practice/components/session/header_layout"
import { EmptyQueueLayout } from "@/practice/components/session/empty_queue_layout"
import { ShellLayout } from "@/practice/components/session/shell_layout"
import { StatusLayout } from "@/practice/components/session/status_layout"
import { useActiveLanguageMeta } from "@/practice/hooks/use_active_language"
import { usePractice } from "@/practice/hooks/use_practice"
import { useSessionUi } from "@/practice/hooks/use_session_ui"
import { usePracticeSessionController } from "@/practice/practice_session_controller"
import { isAssociationOnCard } from "@/practice/practice_session_view_state"
import { associationKindLabel } from "@/practice/practice_utils"
import { useState } from "react"

export function SessionScreenLogic() {
  const { repo, activeLanguageId, setActiveLanguageId } = usePractice()
  const session = usePracticeSessionController(repo, activeLanguageId)
  const ui = useSessionUi(session)
  const { name: languageName, icon: languageIcon } = useActiveLanguageMeta()
  const [languageOpen, setLanguageOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)

  const openLibrary = () => setLibraryOpen(true)

  const languageBar = (
    <HeaderLayout
      languageIcon={languageIcon}
      languageName={languageName}
      progress={
        session.state.status === "ready"
          ? `${session.state.passedCount} passed · ${session.state.totalCases} in deck`
          : "—"
      }
      onOpenLanguages={() => setLanguageOpen(true)}
      onOpenCaseLibrary={openLibrary}
    />
  )

  const languageModal = (
    <LanguageSwitchModal
      open={languageOpen}
      activeLanguageId={activeLanguageId}
      repo={repo}
      onClose={() => setLanguageOpen(false)}
      onSwitch={setActiveLanguageId}
    />
  )

  const caseLibrary = (
    <CaseLibraryDrawer
      open={libraryOpen}
      languageId={activeLanguageId}
      languageName={languageName}
      repo={repo}
      onClose={() => setLibraryOpen(false)}
      onVocabularyChange={() => void session.reloadQueue()}
    />
  )

  if (session.state.status === "loading") {
    return (
      <>
        {languageModal}
        {caseLibrary}
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 p-6">
          {languageBar}
          <StatusLayout kind="loading" />
        </div>
      </>
    )
  }

  if (session.state.status === "error") {
    return (
      <>
        {languageModal}
        {caseLibrary}
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col gap-4 p-6">
          {languageBar}
          <StatusLayout kind="error" message={session.state.error.message} code={session.state.error.code} />
        </div>
      </>
    )
  }

  if (session.state.status !== "ready") {
    return null
  }

  if (session.state.totalCases === 0) {
    return (
      <>
        {languageModal}
        {caseLibrary}
        <EmptyQueueLayout
          languageIcon={languageIcon}
          languageName={languageName}
          onOpenLanguages={() => setLanguageOpen(true)}
          onOpenCaseLibrary={openLibrary}
        />
      </>
    )
  }

  const { phase, passedCount, totalCases } = session.state
  const onFront = phase === "front"
  const card = session.currentCard
  const managing = onFront && (ui.editor === null || ui.editor.intent === "edit") && !ui.adding && !ui.editingCase
  const associationSortable = managing && onFront && !ui.editingCase

  const rows: AssocRow[] = session.visibleAssociations.map((association) => {
    const flags = assocFlags(association, session, ui.editor, phase, managing)
    return {
      association,
      sortable: card ? isAssociationOnCard(card, association.id) : false,
      flags,
      onEdit: () => ui.startAssocEdit(association),
      onHide: () => void session.setAssociationHidden(association.id, true),
      onUnhide: () => void session.setAssociationHidden(association.id, false),
      onDelete: () => ui.setPendingAssocDelete({ id: association.id, label: associationKindLabel(association.kind) }),
      onReveal: () => session.toggleRevealHiddenAssociation(association.id),
      textEdit: (
        <AssocTextFormLayout
          intent="edit"
          initialValue={association.contentRef}
          initialTileColor={association.tileColor}
          saving={session.savingAssociation === "text"}
          onCancel={() => ui.setEditor(null)}
          onSave={(payload) =>
            void ui.saveEditor(() =>
              session.updateTextAssociation(association.id, payload.text, payload.tileColor),
            )
          }
        />
      ),
      urlEdit: (
        <AssocUrlFormLayout
          intent="edit"
          initialValue={association.contentRef}
          saving={session.savingAssociation === "image_url"}
          onCancel={() => ui.setEditor(null)}
          onSave={(url) => void ui.saveEditor(() => session.updateImageAssociationFromUrl(association.id, url))}
        />
      ),
    }
  })

  const addText =
    onFront && ui.editor?.intent === "add" && ui.editor.mode === "text" ? (
      <AssocTextFormLayout
        saving={session.savingAssociation === "text"}
        onCancel={() => ui.setEditor(null)}
        onSave={(payload) =>
          void ui.saveEditor(() => session.addTextAssociation(payload.text, payload.tileColor))
        }
      />
    ) : null

  const addUrl =
    onFront && ui.editor?.intent === "add" && ui.editor.mode === "image_url" ? (
      <AssocUrlFormLayout
        saving={session.savingAssociation === "image_url"}
        onCancel={() => ui.setEditor(null)}
        onSave={(url) => void ui.saveEditor(() => session.addImageAssociationFromUrl(url))}
      />
    ) : null

  return (
    <>
      {languageModal}
      {caseLibrary}
      <ShellLayout
        languageIcon={languageIcon}
        languageName={languageName}
        onOpenLanguages={() => setLanguageOpen(true)}
        onOpenCaseLibrary={openLibrary}
        progress={`${passedCount} passed · ${totalCases} in deck`}
        onFront={onFront}
        editingCase={ui.editingCase}
        caseSaving={ui.caseSaving}
        showAdd={onFront && ui.editor === null && !ui.editingCase}
        saving={ui.saving}
        lemma={ui.lemmaDraft}
        meaning={ui.meaningDraft}
        cardMeaning={card?.meaning ?? undefined}
        revealLemma={card?.lemmaText}
        showLemma={!onFront && card !== null && !ui.editingCase}
        rows={rows}
        addText={addText}
        addUrl={addUrl}
        onLemma={ui.setLemmaDraft}
        onMeaning={ui.setMeaningDraft}
        onCancelCase={() => ui.setEditingCase(false)}
        onSaveCase={() => void ui.saveCaseEdit()}
        onEditCase={ui.startCaseEdit}
        onDeleteCase={() => ui.setPendingCaseDelete(true)}
        onPick={ui.pickAssoc}
        sortable={associationSortable}
        onReorder={(ids) => void session.reorderAssociations(ids)}
        onReveal={session.revealAnswer}
        onGrade={(grade) => void session.submitGrade(grade)}
        grading={session.gradingCase}
        overlays={
          <OverlaysLayout
            createOpen={false}
            createBusy={false}
            onCloseCreate={() => undefined}
            onCreate={() => undefined}
            assocDelete={{
              open: ui.pendingAssocDelete !== null,
              message: ui.pendingAssocDelete
                ? `Remove this ${ui.pendingAssocDelete.label.toLowerCase()} cue from the card? This cannot be undone.`
                : "",
              busy: ui.pendingAssocDelete !== null && session.deletingAssociationId === ui.pendingAssocDelete.id,
              onCancel: () => ui.setPendingAssocDelete(null),
              onConfirm: () => void ui.confirmAssocDelete(),
            }}
            caseDelete={{
              open: ui.pendingCaseDelete,
              message: card ? `Remove “${card.lemmaText}” and all its associations from your vocabulary?` : "",
              busy: card !== null && session.deletingCaseId === card.id,
              onCancel: () => ui.setPendingCaseDelete(false),
              onConfirm: () => void ui.confirmCaseDelete(),
            }}
          />
        }
      />
    </>
  )
}