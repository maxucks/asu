import type { AssocRow } from "@/practice/components/assoc/list_layout"
import { AssocListLayout } from "@/practice/components/assoc/list_layout"
import { CaseFieldsLayout } from "@/practice/components/case/fields_layout"
import { ToolbarLayout } from "@/practice/components/session/toolbar_layout"
import type { AssociationAddAction } from "@/practice/practice_utils"
import type { CaseRepresentationDto } from "@/core/data_sources/http_case_data_source"
import { CaseValueRevealLayout } from "@/practice/components/case/case_value_reveal_layout"
import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import type { ReactNode } from "react"

export type CaseLibraryDetailLayoutProps = {
  readonly caseTitle: string
  readonly representations?: readonly CaseRepresentationDto[]
  readonly editingCase: boolean
  readonly caseSaving: boolean
  readonly showAdd: boolean
  readonly saving: boolean
  readonly value: string
  readonly meaning: string
  readonly cardMeaning?: string
  readonly rows: readonly AssocRow[]
  readonly addText: ReactNode
  readonly addUrl: ReactNode
  readonly onValue: (v: string) => void
  readonly onMeaning: (v: string) => void
  readonly representationTypes?: readonly RepresentationTypeDto[]
  readonly representationDrafts?: Record<number, string>
  readonly onRepresentationDraft?: (typeId: number, text: string) => void
  readonly onCancelCase: () => void
  readonly onSaveCase: () => void
  readonly onEditCase: () => void
  readonly onDeleteCase: () => void
  readonly onPick: (action: AssociationAddAction) => void
  readonly sortable?: boolean
  readonly onReorder?: (associationIds: readonly string[]) => void
  readonly caseCategories?: ReactNode
}

export function CaseLibraryDetailLayout(props: CaseLibraryDetailLayoutProps) {
  const displayTitle = props.editingCase ? props.value : props.caseTitle

  return (
    <section className="scrollbar-hidden flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl border border-grid-line bg-card">
      <div className="space-y-3 border-b border-grid-line px-5 py-5">
        <ToolbarLayout
          variant="library"
          caseTitle={displayTitle}
          onFront
          editingCase={props.editingCase}
          caseSaving={props.caseSaving}
          onCancelCase={props.onCancelCase}
          onSaveCase={props.onSaveCase}
          onEditCase={props.onEditCase}
          onDeleteCase={props.onDeleteCase}
        />
        {props.editingCase ? (
          <CaseFieldsLayout
            value={props.value}
            meaning={props.meaning}
            disabled={props.caseSaving}
            onValue={props.onValue}
            onMeaning={props.onMeaning}
            representationTypes={props.representationTypes}
            representationDrafts={props.representationDrafts}
            onRepresentationDraft={props.onRepresentationDraft}
          />
        ) : (
          <>
            <CaseValueRevealLayout
              representations={props.representations}
              variant="inline"
            />
            {props.cardMeaning ? (
              <p className="rounded-xl border border-grid-line bg-tile px-4 py-3 text-sm leading-relaxed text-foreground/90">
                {props.cardMeaning}
              </p>
            ) : null}
          </>
        )}
        {props.caseCategories ? (
          <div className="relative z-20 overflow-visible">{props.caseCategories}</div>
        ) : null}
      </div>

      <h2 className="sr-only">Associations</h2>
      <AssocListLayout
        rows={props.rows}
        showAdd={props.showAdd}
        saving={props.saving}
        addText={props.addText}
        addUrl={props.addUrl}
        onPick={props.onPick}
        associationTextClassName="text-sm"
        sortable={props.sortable}
        onReorder={props.onReorder}
      />
    </section>
  )
}