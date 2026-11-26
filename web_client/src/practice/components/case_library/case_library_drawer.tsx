import {
  PracticeLibraryDrawer,
  type OpenPracticeLibraryOptions,
} from "@/practice/components/library/practice_library_drawer"
import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import type { PracticeRepository } from "@/practice/practice_repository"

export type { OpenPracticeLibraryOptions }

type CaseLibraryDrawerProps = {
  readonly open: boolean
  readonly languageId: string
  readonly languageName?: string
  readonly languageIcon?: string
  readonly repo: PracticeRepository
  readonly onClose: () => void
  readonly onVocabularyChange?: () => void
  readonly representationTypes: readonly RepresentationTypeDto[]
  readonly tab: NonNullable<OpenPracticeLibraryOptions["tab"]>
  readonly onTab: (tab: NonNullable<OpenPracticeLibraryOptions["tab"]>) => void
  readonly initialNoteId?: string | null
  readonly linkCaseId?: string | null
  readonly attachedNoteIds?: readonly string[]
}

export function CaseLibraryDrawer(props: CaseLibraryDrawerProps) {
  const {
    open,
    languageId,
    languageName,
    languageIcon,
    repo,
    onClose,
    onVocabularyChange,
    representationTypes,
    tab,
    onTab,
    initialNoteId,
    linkCaseId,
    attachedNoteIds,
  } = props

  return (
    <PracticeLibraryDrawer
      open={open}
      languageId={languageId}
      languageName={languageName}
      languageIcon={languageIcon}
      repo={repo}
      representationTypes={representationTypes}
      onClose={onClose}
      onVocabularyChange={onVocabularyChange}
      tab={tab}
      onTab={onTab}
      initialNoteId={initialNoteId}
      linkCaseId={linkCaseId}
      attachedNoteIds={attachedNoteIds}
    />
  )
}