import { assocFlags } from "@/practice/assoc_flags"
import { CaseLibraryDrawer } from "@/practice/components/case_library/case_library_drawer"
import { LanguageSwitchModal } from "@/practice/components/language/language_switch_modal"
import type { AssocRow } from "@/practice/components/assoc/list_layout"
import { AssocTextFormLayout } from "@/practice/components/assoc/text_form_layout"
import { AssocUrlFormLayout } from "@/practice/components/assoc/url_form_layout"
import { OverlaysLayout } from "@/practice/components/session/overlays_layout"
import { ShellLayout } from "@/practice/components/session/shell_layout"
import { PracticeCardPlaceholderLayout } from "@/practice/components/session/practice_card_placeholder_layout"
import type { CaseLibraryDetailTab } from "@/practice/components/case_library/case_library_detail_tab_bar"
import { PracticeCardEmptyLayout } from "@/practice/components/session/practice_card_empty_layout"
import { PracticeErrorCodes } from "@/practice/practice_errors"
import { useActiveLanguageMeta } from "@/practice/hooks/use_active_language"
import { usePractice } from "@/practice/hooks/use_practice"
import { useRepresentationTypes } from "@/practice/hooks/use_representation_types"
import { useSessionUi } from "@/practice/hooks/use_session_ui"
import { usePracticeSessionController } from "@/practice/practice_session_controller"
import {
  isAssociationOnCard,
  isPracticeSessionReadyViewState,
} from "@/practice/practice_session_view_state"
import { associationKindLabel } from "@/practice/practice_utils"
import { CategoryFilterModal } from "@/practice/components/category/category_filter_modal"
import { CaseNoteAttachField } from "@/practice/components/notes/case_note_attach_field"
import { useLanguageNotes } from "@/practice/hooks/use_language_notes"
import type { LibraryTab } from "@/practice/components/library/library_tab_bar"
import { LibraryFab } from "@/practice/components/notes/notes_fab"
import { CaseCategoryField } from "@/practice/components/category/case_category_field"
import type { CategoryDto } from "@/practice/practice_repository"
import { useCallback, useEffect, useState } from "react"

export function SessionScreenLogic() {
  const { repo, activeLanguageId, setActiveLanguageId, activeCategoryId, setActiveCategoryId } = usePractice()
  const session = usePracticeSessionController(repo, activeLanguageId, activeCategoryId)
  const { types: representationTypes } = useRepresentationTypes(repo, activeLanguageId)
  const ui = useSessionUi(session, representationTypes)
  const { notes: languageNotes, refresh: refreshLanguageNotes } = useLanguageNotes(repo, activeLanguageId)
  const [noteAttachBusy, setNoteAttachBusy] = useState(false)
  const [practiceDetailTab, setPracticeDetailTab] = useState<CaseLibraryDetailTab>("entry")
  const { name: languageName, icon: languageIcon } = useActiveLanguageMeta()
  const [languageOpen, setLanguageOpen] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [libraryTab, setLibraryTab] = useState<LibraryTab>("cases")
  const [libraryNoteId, setLibraryNoteId] = useState<string | null>(null)
  const [libraryLinkCaseId, setLibraryLinkCaseId] = useState<string | null>(null)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categories, setCategories] = useState<readonly CategoryDto[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [totalLanguageCases, setTotalLanguageCases] = useState(0)

  const refreshCategoryMeta = useCallback(async () => {
    setCategoriesLoading(true)
    const [cats, list] = await Promise.all([
      repo.listCategories(activeLanguageId),
      repo.listCases(activeLanguageId, null),
    ])
    setCategoriesLoading(false)
    if (cats.ok) setCategories(cats.value)
    if (list.ok) setTotalLanguageCases(list.value.cards.length)
    return cats.ok ? cats.value : null
  }, [activeLanguageId, repo])

  useEffect(() => {
    void refreshCategoryMeta()
  }, [refreshCategoryMeta])

  useEffect(() => {
    if (categoryOpen) void refreshCategoryMeta()
  }, [categoryOpen, refreshCategoryMeta])

  const activeCategory = categories.find((item) => item.id === activeCategoryId) ?? null
  const activeCategoryName = activeCategory?.name ?? (activeCategoryId ? "Category" : "All cards")
  const headerCategoryLabel = activeCategoryId ? activeCategoryName : "Category"
  const headerCategoryCount = activeCategoryId
    ? (activeCategory?.caseCount ??
      (session.state.status === "ready" ? session.state.totalCases : 0))
    : totalLanguageCases

  const openLibrary = (options?: {
    readonly tab?: LibraryTab
    readonly noteId?: string | null
    readonly linkCaseId?: string | null
  }) => {
    const tab = options?.tab ?? (options?.noteId || options?.linkCaseId ? "notes" : libraryTab)
    setLibraryTab(tab)
    setLibraryNoteId(options?.noteId ?? null)
    setLibraryLinkCaseId(options?.linkCaseId ?? null)
    setLibraryOpen(true)
  }

  const closeLibrary = () => {
    setLibraryOpen(false)
    setLibraryNoteId(null)
    setLibraryLinkCaseId(null)
  }

  const headerCategoryProps = {
    categoryLabel: headerCategoryLabel,
    categoryCount: headerCategoryCount,
    categoryActive: activeCategoryId !== null,
    onOpenCategory: () => setCategoryOpen(true),
    onClearCategory: () => setActiveCategoryId(null),
  }

  const handleCaseCategoriesChange = useCallback(
    async (caseId: string, ids: readonly string[]) => {
      const ok = await session.setCaseCategories(caseId, ids)
      if (!ok) return
      const nextCategories = await refreshCategoryMeta()
      if (activeCategoryId && nextCategories && !nextCategories.some((item) => item.id === activeCategoryId)) {
        setActiveCategoryId(null)
      } else if (activeCategoryId) {
        void session.reloadQueue()
      }
    },
    [activeCategoryId, refreshCategoryMeta, session, setActiveCategoryId],
  )

  const attachCaseId =
    session.state.status === "ready" ? (session.currentCard?.id ?? null) : null

  const handleAttachNote = useCallback(
    async (noteId: string) => {
      if (!attachCaseId) return false
      setNoteAttachBusy(true)
      const result = await repo.linkCaseNote(attachCaseId, { noteId })
      setNoteAttachBusy(false)
      if (!result.ok) return false
      await session.reloadQueue()
      await refreshLanguageNotes()
      return true
    },
    [attachCaseId, refreshLanguageNotes, repo, session],
  )

  const handleCreateAndAttachNote = useCallback(
    async (name: string, content: string) => {
      if (!attachCaseId) return false
      setNoteAttachBusy(true)
      const result = await repo.linkCaseNote(attachCaseId, { name, content })
      setNoteAttachBusy(false)
      if (!result.ok) return false
      await session.reloadQueue()
      await refreshLanguageNotes()
      return true
    },
    [attachCaseId, refreshLanguageNotes, repo, session],
  )

  const handleDetachNote = useCallback(
    async (noteId: string) => {
      if (!attachCaseId) return false
      setNoteAttachBusy(true)
      const result = await repo.unlinkCaseNote(attachCaseId, noteId)
      setNoteAttachBusy(false)
      if (!result.ok) return false
      await session.reloadQueue()
      await refreshLanguageNotes()
      return true
    },
    [attachCaseId, refreshLanguageNotes, repo, session],
  )

  const categoryModal = (
    <CategoryFilterModal
      open={categoryOpen}
      categories={categories}
      activeCategoryId={activeCategoryId}
      totalInLanguage={totalLanguageCases}
      loading={categoriesLoading}
      onClose={() => setCategoryOpen(false)}
      onSelect={(id) => setActiveCategoryId(id)}
      onClear={() => setActiveCategoryId(null)}
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

  const practiceLibrary = (
    <CaseLibraryDrawer
      open={libraryOpen}
      languageId={activeLanguageId}
      languageName={languageName}
      languageIcon={languageIcon}
      representationTypes={representationTypes}
      repo={repo}
      onClose={closeLibrary}
      tab={libraryTab}
      onTab={setLibraryTab}
      initialNoteId={libraryNoteId}
      linkCaseId={libraryLinkCaseId}
      attachedNoteIds={
        session.state.status === "ready" && session.currentCard
          ? session.currentCard.notes.map((note) => note.id)
          : []
      }
      onVocabularyChange={() => void session.reloadQueue()}
      onNavigateToNote={({ noteId, linkCaseId }) => {
        setLibraryNoteId(noteId)
        setLibraryLinkCaseId(linkCaseId)
      }}
    />
  )

  const readyState = isPracticeSessionReadyViewState(session.state) ? session.state : null
  const sessionReady = readyState !== null
  const sessionError = session.state.status === "error" ? session.state.error : null
  const forcedEmpty =
    session.state.status === "error" && sessionError?.code === PracticeErrorCodes.NoCards
  const sessionLoading = session.state.status === "loading"

  const phase = readyState?.phase ?? "front"
  const passedCount = readyState?.passedCount ?? 0
  const totalCases = readyState?.totalCases ?? totalLanguageCases
  const onFront = phase === "front"
  const card = session.currentCard

  useEffect(() => {
    setPracticeDetailTab("entry")
  }, [card?.id])

  useEffect(() => {
    if (ui.editingCase && practiceDetailTab === "notes") setPracticeDetailTab("entry")
  }, [practiceDetailTab, ui.editingCase])
  const deckEmpty =
    forcedEmpty || (sessionReady && (totalCases === 0 || card === null))
  const showPracticeCard = sessionReady && !deckEmpty && card !== null

  const progressLabel = sessionLoading
    ? "Loading…"
    : sessionReady
      ? `${passedCount} passed · ${totalCases} in deck`
      : "—"

  const mainSlot = showPracticeCard
    ? undefined
    : deckEmpty && (sessionReady || forcedEmpty)
      ? (
          <PracticeCardEmptyLayout
            categoryActive={activeCategoryId !== null}
            onClearCategory={() => setActiveCategoryId(null)}
          />
        )
      : (
          <PracticeCardPlaceholderLayout />
        )

  const notesPanel =
    showPracticeCard && card && !ui.editingCase ? (
      <CaseNoteAttachField
        notes={card.notes}
        languageNotes={languageNotes}
        disabled={ui.saving || noteAttachBusy}
        attaching={noteAttachBusy}
        onOpenNote={(noteId) => openLibrary({ tab: "notes", noteId, linkCaseId: card.id })}
        onAttach={handleAttachNote}
        onCreateAndAttach={handleCreateAndAttachNote}
        onDetach={handleDetachNote}
      />
    ) : (
      <p className="text-sm text-muted">Finish editing the entry to manage notes.</p>
    )

  const sessionBanner =
    sessionError && sessionError.code !== PracticeErrorCodes.NoCards ? (
      <div className="flex flex-col gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
        <p>{sessionError.message}</p>
        <button
          type="button"
          className="self-start rounded-lg border border-danger/40 bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-danger/60"
          onClick={() => void session.reloadPracticeSession()}
        >
          Retry
        </button>
      </div>
    ) : null

  const managing = onFront && (ui.editor === null || ui.editor.intent === "edit") && !ui.adding && !ui.editingCase
  const associationSortable = managing && onFront && !ui.editingCase

  const rows: AssocRow[] = showPracticeCard
    ? session.visibleAssociations.map((association) => {
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
    : []

  const addText =
    showPracticeCard && onFront && ui.editor?.intent === "add" && ui.editor.mode === "text" ? (
      <AssocTextFormLayout
        saving={session.savingAssociation === "text"}
        onCancel={() => ui.setEditor(null)}
        onSave={(payload) =>
          void ui.saveEditor(() => session.addTextAssociation(payload.text, payload.tileColor))
        }
      />
    ) : null

  const addUrl =
    showPracticeCard && onFront && ui.editor?.intent === "add" && ui.editor.mode === "image_url" ? (
      <AssocUrlFormLayout
        saving={session.savingAssociation === "image_url"}
        onCancel={() => ui.setEditor(null)}
        onSave={(url) => void ui.saveEditor(() => session.addImageAssociationFromUrl(url))}
      />
    ) : null

  return (
    <>
      {languageModal}
        {practiceLibrary}
        {categoryModal}
        <LibraryFab onOpen={() => openLibrary()} />
      <ShellLayout
        languageIcon={languageIcon}
        languageName={languageName}
        onOpenLanguages={() => setLanguageOpen(true)}
        onOpenCaseLibrary={() => openLibrary({ tab: "cases" })}
        progress={progressLabel}
        {...headerCategoryProps}
        sessionBanner={sessionBanner}
        main={mainSlot}
        footerDisabled={!showPracticeCard}
        onFront={onFront}
        editingCase={ui.editingCase}
        caseSaving={ui.caseSaving}
        showAdd={showPracticeCard && onFront && ui.editor === null && !ui.editingCase}
        saving={ui.saving}
        value={ui.valueDraft}
        meaning={ui.meaningDraft}
        cardMeaning={card?.meaning ?? undefined}
        revealValue={card?.value}
        revealRepresentations={card?.representations}
        showValue={!onFront && card !== null && !ui.editingCase}
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
        onReorder={(ids) => void session.reorderAssociations(ids)}
        caseCategories={
          !ui.editingCase && card ? (
            <CaseCategoryField
              categories={categories}
              value={card.categories}
              disabled={ui.saving || session.categoriesBusy}
              onCreateCategory={async (name) => {
                const result = await repo.createCategory(activeLanguageId, name)
                if (!result.ok) return null
                await refreshCategoryMeta()
                return result.value
              }}
              onChange={(ids) => void handleCaseCategoriesChange(card.id, ids)}
            />
          ) : null
        }
        onReveal={session.revealAnswer}
        onGrade={(grade) => void session.submitGrade(grade)}
        grading={session.gradingCase}
        tab={practiceDetailTab}
        onTab={setPracticeDetailTab}
        notesCount={card?.notes.length ?? 0}
        notesPanel={notesPanel}
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
              message: card ? `Remove “${card.value}” and all its associations from your vocabulary?` : "",
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