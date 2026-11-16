import { assocFlags } from "@/practice/assoc_flags"
import { usePracticeRepo } from "@/practice/hooks/use_practice"
import { useSessionUi } from "@/practice/hooks/use_session_ui"
import { usePracticeSessionController } from "@/practice/practice_session_controller"
import { associationKindLabel } from "@/practice/practice_utils"
import type { AssocRow } from "@/practice/components/assoc/list_layout"
import { AssocTextFormLayout } from "@/practice/components/assoc/text_form_layout"
import { AssocUrlFormLayout } from "@/practice/components/assoc/url_form_layout"
import { OverlaysLayout } from "@/practice/components/session/overlays_layout"
import { ShellLayout } from "@/practice/components/session/shell_layout"
import { StatusLayout } from "@/practice/components/session/status_layout"

export function SessionScreenLogic() {
  const session = usePracticeSessionController(usePracticeRepo())
  const ui = useSessionUi(session)

  if (session.state.status === "loading") return <StatusLayout kind="loading" />
  if (session.state.status === "error") {
    return <StatusLayout kind="error" message={session.state.error.message} code={session.state.error.code} />
  }
  if (session.state.status === "finished") return <StatusLayout kind="finished" />

  const { cardIndex, cards, phase } = session.state
  const onFront = phase === "front"
  const card = session.currentCard
  const managing = onFront && (ui.editor === null || ui.editor.intent === "edit") && !ui.adding && !ui.editingCase

  const rows: AssocRow[] = session.visibleAssociations.map((association) => {
    const flags = assocFlags(association, session, ui.editor, phase, managing)
    return {
      association,
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
          saving={session.savingAssociation === "text"}
          onCancel={() => ui.setEditor(null)}
          onSave={(text) => void ui.saveEditor(() => session.updateTextAssociation(association.id, text))}
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
        onSave={(text) => void ui.saveEditor(() => session.addTextAssociation(text))}
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
    <ShellLayout
      language={card?.languageName}
      progress={`${cardIndex + 1} / ${cards.length}`}
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
      onReveal={session.revealAnswer}
      onGrade={session.submitGrade}
      onNewCase={() => ui.setCreateOpen(true)}
      overlays={
        <OverlaysLayout
          createOpen={ui.createOpen}
          createBusy={session.caseBusy === "create"}
          onCloseCreate={() => ui.setCreateOpen(false)}
          onCreate={(lemma, meaning) => {
            void (async () => {
              if (await session.createCase(lemma, meaning)) ui.setCreateOpen(false)
            })()
          }}
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
  )
}