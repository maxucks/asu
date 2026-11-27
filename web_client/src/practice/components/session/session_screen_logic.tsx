import { assocFlags } from "@/practice/assoc_flags"
import { CaseLibraryDrawer } from "@/practice/components/case_library/case_library_drawer"
import { LanguageSwitchModal } from "@/practice/components/language/language_switch_modal"
import type { AssocRow } from "@/practice/components/assoc/list_layout"
import {
  associationAddImageUrlView,
  associationAddTextView,
  associationEditViews,
} from "@/practice/components/assoc/assoc_row_views"
import { OverlaysLayout } from "@/practice/components/session/overlays_layout"
import { ShellLayout } from "@/practice/components/session/shell_layout"
import { PracticeCardPlaceholderLayout } from "@/practice/components/session/practice_card_placeholder_layout"
import type { CaseLibraryDetailTab } from "@/practice/components/case_library/case_library_detail_tab_bar"
import { LibraryFab } from "@/practice/components/notes/notes_fab"
import { usePracticeHotkeyBindings } from "@/practice/hooks/use_practice_hotkey_bindings"
import { PracticeCardEmptyLayout } from "@/practice/components/session/practice_card_empty_layout"
import { PracticeErrorCodes } from "@/practice/practice_errors"
import { useActiveLanguageMeta } from "@/practice/hooks/use_active_language"
import { usePractice } from "@/practice/hooks/use_practice"
import { PracticeModeControls } from "@/practice/components/session/practice_mode_controls"
import { TypingFooterLayout } from "@/practice/components/session/typing_footer_layout"
import { TypingReviewFooterLayout } from "@/practice/components/session/typing_review_footer_layout"
import { usePracticeModePreference } from "@/practice/hooks/use_practice_mode_preference"
import { useRepresentationTypes } from "@/practice/hooks/use_representation_types"
import { useSessionUi } from "@/practice/hooks/use_session_ui"
import { PracticeCard } from "@/practice/practice_model"
import { usePracticeSessionController } from "@/practice/practice_session_controller"
import { expectedStringForTypingTarget, typingTargetLabel } from "@/practice/practice_typing_targets"
import {
  isAssociationOnCard,
  isPracticeSessionReadyViewState,
} from "@/practice/practice_session_view_state"
import { associationKindLabel } from "@/practice/practice_utils"
import { CategoryFilterModal } from "@/practice/components/category/category_filter_modal"
import { CaseNoteAttachField } from "@/practice/components/notes/case_note_attach_field"
import { useLanguageNotes } from "@/practice/hooks/use_language_notes"
import type { LibraryTab } from "@/practice/components/library/library_tab_bar"
import { PracticeCaseContextDisplay } from "@/practice/components/case/practice_case_context_display"
import { CaseCategoryField } from "@/practice/components/category/case_category_field"
import { usePracticeEntryContextPreference } from "@/practice/hooks/use_practice_entry_context_preference"
import type { CategoryDto, PracticeGradeDto } from "@/practice/practice_repository"
import { useCallback, useEffect, useMemo, useState } from "react"

export function SessionScreenLogic() {
  const { repo, activeLanguageId, setActiveLanguageId, activeCategoryId, setActiveCategoryId } = usePractice()
  const { types: representationTypes } = useRepresentationTypes(repo, activeLanguageId)
  const { practiceMode, setPracticeMode, typingTarget, setTypingTarget } = usePracticeModePreference(
    activeLanguageId,
    representationTypes,
  )
  const sessionConfig = useMemo(
    () => ({
      practiceMode,
      typingTarget,
      representationTypes,
    }),
    [practiceMode, representationTypes, typingTarget],
  )
  const session = usePracticeSessionController(repo, activeLanguageId, activeCategoryId, sessionConfig)
  const ui = useSessionUi(session, representationTypes)

  const entryContextCard = useMemo(() => {
    const current = session.currentCard
    if (!current) return null
    return {
      value: current.value,
      meaning: current.meaning,
      representations: current.representations,
    }
  }, [session.currentCard])

  const { selection: entryContextSelection, setSelection: setEntryContextSelection } =
    usePracticeEntryContextPreference(activeLanguageId, representationTypes, entryContextCard)
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
  const [vocabularyCards, setVocabularyCards] = useState<readonly PracticeCard[]>([])

  const refreshVocabularyForPractice = useCallback(async () => {
    const list = await repo.listCases(activeLanguageId, activeCategoryId)
    if (list.ok) {
      setVocabularyCards(list.value.cards.map((dto) => PracticeCard.fromDto(dto)))
    }
  }, [activeCategoryId, activeLanguageId, repo])

  useEffect(() => {
    void refreshVocabularyForPractice()
  }, [refreshVocabularyForPractice])

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
      onVocabularyChange={() => {
        void session.reloadQueue()
        void refreshVocabularyForPractice()
      }}
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
  const totalCases = readyState?.totalCases ?? totalLanguageCases
  const packSize = readyState?.playQueue.length ?? 0
  const packPosition =
    readyState && packSize > 0 ? Math.min(readyState.playQueueIndex + 1, packSize) : 0

  const answeredCount = readyState?.passedCount ?? 0
  const answeredCountLabel =
    answeredCount === 1 ? "1 word" : `${answeredCount} words`

  const vocabularyCountLabel =
    totalCases === 0 ? "no words" : totalCases === 1 ? "1 word" : `${totalCases} words`
  const onFront = phase === "front"
  const card = session.currentCard

  useEffect(() => {
    setPracticeDetailTab("entry")
  }, [card?.id])

  useEffect(() => {
    if (ui.editingCase && practiceDetailTab === "notes") setPracticeDetailTab("entry")
  }, [practiceDetailTab, ui.editingCase])

  const deckEmpty =
    forcedEmpty || (sessionReady && (totalCases === 0 || packSize === 0))
  const showPracticeCard = sessionReady && !deckEmpty && card !== null

  useEffect(() => {
    const gradeByKey: Record<string, PracticeGradeDto> = {
      "1": "hard",
      "2": "medium",
      "3": "easy",
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (practiceMode !== "associations" || ui.editingCase || ui.editor !== null || session.gradingCase) {
        return
      }
      if (!showPracticeCard) return
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault()
        if (phase === "front") {
          session.revealAnswer()
        } else if (phase === "back") {
          void session.submitGrade(event.shiftKey ? "hard" : "easy")
        }
        return
      }

      if (phase !== "back") return

      const grade = gradeByKey[event.key]
      if (!grade) return

      event.preventDefault()
      void session.submitGrade(grade)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [phase, practiceMode, session, showPracticeCard, ui.editingCase, ui.editor])

  const progressLabel = sessionLoading
    ? "Loading…"
    : sessionReady && packSize > 0
      ? `${packPosition} / ${packSize} in pack · ${answeredCountLabel}`
      : sessionReady
        ? vocabularyCountLabel
        : "—"

  const typingEmptyDetail =
    practiceMode === "typing" && sessionReady && totalCases === 0
      ? `No words with ${typingTargetLabel(typingTarget, representationTypes)} in this filter. Choose another type or add representations in the library.`
      : undefined

  const typingExpected =
    card && practiceMode === "typing" ? expectedStringForTypingTarget(card, typingTarget) : null

  const typingAwaitingNext =
    practiceMode === "typing" &&
    showPracticeCard &&
    readyState?.phase === "back" &&
    readyState.typingCheckCorrect !== null

  usePracticeHotkeyBindings(
    practiceMode,
    phase,
    showPracticeCard,
    typingAwaitingNext,
    ui.editingCase,
  )

  const answerFooter =
    practiceMode === "typing" && showPracticeCard && onFront && typingExpected ? (
      <TypingFooterLayout
        cardKey={card.id}
        expected={typingExpected}
        target={typingTarget}
        representationTypes={representationTypes}
        disabled={ui.editingCase}
        grading={session.gradingCase}
        onComplete={() => session.acceptTypingAnswer()}
        onSkip={() => session.skipTypingAnswer()}
      />
    ) : typingAwaitingNext ? (
      <TypingReviewFooterLayout
        disabled={ui.editingCase}
        grading={session.gradingCase}
        onNext={() => void session.continueAfterTyping()}
      />
    ) : undefined

  const modeControls = (
    <PracticeModeControls
      practiceMode={practiceMode}
      onPracticeMode={setPracticeMode}
      typingTarget={typingTarget}
      onTypingTarget={setTypingTarget}
      representationTypes={representationTypes}
      eligibleCards={vocabularyCards}
      disabled={sessionLoading || ui.editingCase}
    />
  )

  const mainSlot = showPracticeCard
    ? undefined
    : deckEmpty && (sessionReady || forcedEmpty)
      ? (
          <PracticeCardEmptyLayout
            categoryActive={activeCategoryId !== null}
            onClearCategory={() => setActiveCategoryId(null)}
            detail={typingEmptyDetail}
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
  const noAssociationCues = showPracticeCard && session.visibleAssociations.length === 0
  const showAssociationAdd =
    showPracticeCard && (onFront || noAssociationCues) && ui.editor === null && !ui.editingCase

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
      ...associationEditViews(association, {
        textSaving: session.savingAssociation === "text",
        imageUrlSaving: session.savingAssociation === "image_url",
        onCancelEdit: () => ui.setEditor(null),
        onSaveTextEdit: (associationId, payload) =>
          void ui.saveEditor(() =>
            session.updateTextAssociation(associationId, payload.text, payload.tileColor),
          ),
        onSaveImageUrlEdit: (associationId, url) =>
          void ui.saveEditor(() => session.updateImageAssociationFromUrl(associationId, url)),
      }),
    }
  })
    : []

  const canComposeAssociation = onFront || noAssociationCues

  const addHandlers = {
    textSaving: session.savingAssociation === "text",
    imageUrlSaving: session.savingAssociation === "image_url",
    onCancelAdd: () => ui.setEditor(null),
    onSaveAddText: (payload: { readonly text: string; readonly tileColor: string | null }) =>
      void ui.saveEditor(() => session.addTextAssociation(payload.text, payload.tileColor)),
    onSaveAddImageUrl: (url: string) => void ui.saveEditor(() => session.addImageAssociationFromUrl(url)),
  }

  const addText =
    showPracticeCard && canComposeAssociation && ui.editor?.intent === "add" && ui.editor.mode === "text"
      ? associationAddTextView(addHandlers)
      : null

  const addUrl =
    showPracticeCard && canComposeAssociation && ui.editor?.intent === "add" && ui.editor.mode === "image_url"
      ? associationAddImageUrlView(addHandlers)
      : null

  const practiceEntryContext =
    showPracticeCard && card && !ui.editingCase ? (
      <PracticeCaseContextDisplay
        value={card.value}
        meaning={card.meaning}
        representations={card.representations}
        representationTypes={representationTypes}
        selection={entryContextSelection}
        onSelection={setEntryContextSelection}
      />
    ) : undefined

  return (
    <>
      {languageModal}
        {practiceLibrary}
        {categoryModal}
      {modeControls}
      <LibraryFab onOpen={() => openLibrary({ tab: "cases" })} />
      <ShellLayout
        languageIcon={languageIcon}
        languageName={languageName}
        onOpenLanguages={() => setLanguageOpen(true)}
        progress={progressLabel}
        {...headerCategoryProps}
        sessionBanner={sessionBanner}
        main={mainSlot}
        answerFooter={answerFooter}
        footerDisabled={!showPracticeCard}
        onFront={onFront}
        editingCase={ui.editingCase}
        caseSaving={ui.caseSaving}
        showAdd={showAssociationAdd}
        saving={ui.saving}
        value={ui.valueDraft}
        meaning={ui.meaningDraft}
        practiceEntryContext={practiceEntryContext}
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