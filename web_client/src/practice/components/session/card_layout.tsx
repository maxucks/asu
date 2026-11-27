import { CaseEntryLayout, type CaseEntryLayoutProps } from "@/practice/components/case/case_entry_layout"
import { practiceCardShellClassName } from "@/practice/components/session/practice_card_shell"
import type { CaseRepresentationDto } from "@/core/data_sources/http_case_data_source"

export type CardLayoutProps = Omit<
  CaseEntryLayoutProps,
  "shellClassName" | "toolbarVariant" | "onFront" | "headerRepresentations" | "answerReveal" | "caseTitle"
> & {
  readonly flat?: boolean
  readonly onFront: boolean
  readonly revealValue?: string
  readonly revealRepresentations?: readonly CaseRepresentationDto[]
  readonly showValue: boolean
  readonly practiceEntryContext?: CaseEntryLayoutProps["practiceEntryContext"]
}

export function CardLayout(props: CardLayoutProps) {
  const {
    flat,
    onFront,
    revealValue,
    revealRepresentations,
    showValue,
    practiceEntryContext,
    ...entry
  } = props

  const answerReveal =
    showValue && revealValue
      ? { value: revealValue, representations: revealRepresentations }
      : null

  return (
    <CaseEntryLayout
      {...entry}
      shellClassName={practiceCardShellClassName(flat)}
      toolbarVariant="practice"
      onFront={onFront}
      answerReveal={answerReveal}
      practiceEntryContext={practiceEntryContext}
    />
  )
}