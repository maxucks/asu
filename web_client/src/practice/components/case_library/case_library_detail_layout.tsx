import { CaseEntryLayout, type CaseEntryLayoutProps } from "@/practice/components/case/case_entry_layout"
import type { CaseRepresentationDto } from "@/core/data_sources/http_case_data_source"

const libraryDetailShellClassName =
  "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-grid-line bg-card"

export type CaseLibraryDetailLayoutProps = Omit<
  CaseEntryLayoutProps,
  "shellClassName" | "toolbarVariant" | "onFront" | "headerRepresentations" | "answerReveal"
> & {
  readonly caseTitle: string
  readonly representations?: readonly CaseRepresentationDto[]
}

export function CaseLibraryDetailLayout(props: CaseLibraryDetailLayoutProps) {
  const { caseTitle, representations, associationTextClassName, ...entry } = props

  return (
    <CaseEntryLayout
      {...entry}
      caseTitle={caseTitle}
      shellClassName={libraryDetailShellClassName}
      toolbarVariant="library"
      headerRepresentations={representations}
      associationTextClassName={associationTextClassName ?? "text-sm"}
    />
  )
}