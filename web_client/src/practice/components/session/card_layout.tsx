import type { AssocRow } from "@/practice/components/assoc/list_layout"
import { AssocListLayout } from "@/practice/components/assoc/list_layout"
import { CaseFieldsLayout } from "@/practice/components/case/fields_layout"
import { ToolbarLayout } from "@/practice/components/session/toolbar_layout"
import type { AssociationAddAction } from "@/practice/practice_utils"
import type { CaseRepresentationDto } from "@/core/data_sources/http_case_data_source"
import { CaseValueRevealLayout } from "@/practice/components/case/case_value_reveal_layout"
import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"
import {
  CaseLibraryDetailTabBar,
  type CaseLibraryDetailTab,
} from "@/practice/components/case_library/case_library_detail_tab_bar"
import type { ReactNode } from "react"

export type CardLayoutProps = {
  readonly flat?: boolean
  readonly onFront: boolean
  readonly editingCase: boolean
  readonly caseSaving: boolean
  readonly showAdd: boolean
  readonly saving: boolean
  readonly value: string
  readonly meaning: string
  readonly cardMeaning?: string
  readonly revealValue?: string
  readonly revealRepresentations?: readonly CaseRepresentationDto[]
  readonly showValue: boolean
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
  readonly tab: CaseLibraryDetailTab
  readonly onTab: (tab: CaseLibraryDetailTab) => void
  readonly notesCount: number
  readonly notesPanel?: ReactNode
}

export function CardLayout(props: CardLayoutProps) {
  return (
    <section
      className={`flex min-h-[min(70vh,32rem)] flex-1 flex-col overflow-hidden rounded-2xl border border-grid-line bg-card ${props.flat ? "" : "shadow-lg"}`}
    >
      <div className="shrink-0 space-y-3 px-5 pb-3 pt-5">
        <ToolbarLayout
          onFront={props.onFront}
          editingCase={props.editingCase}
          caseSaving={props.caseSaving}
          onCancelCase={props.onCancelCase}
          onSaveCase={props.onSaveCase}
          onEditCase={props.onEditCase}
          onDeleteCase={props.onDeleteCase}
        />
      </div>
      <div className="shrink-0 border-b border-grid-line px-5 pb-3">
        <CaseLibraryDetailTabBar tab={props.tab} onTab={props.onTab} notesCount={props.notesCount} />
      </div>

      {props.tab === "entry" ? (
        <div className="shrink-0 space-y-3 border-b border-grid-line px-5 py-5">
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
          ) : props.cardMeaning ? (
            <p className="rounded-xl border border-grid-line bg-tile px-4 py-3 text-sm leading-relaxed text-foreground/90">
              {props.cardMeaning}
            </p>
          ) : null}
          {props.caseCategories ? (
            <div className="relative z-20 overflow-visible">{props.caseCategories}</div>
          ) : null}
        </div>
      ) : null}

      <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto">
        {props.tab === "entry" ? (
          <>
            <h2 className="sr-only">Associations</h2>
            <AssocListLayout
              rows={props.rows}
              showAdd={props.showAdd}
              saving={props.saving}
              addText={props.addText}
              addUrl={props.addUrl}
              onPick={props.onPick}
              sortable={props.sortable}
              onReorder={props.onReorder}
            />
          </>
        ) : (
          <div className="px-5 py-5">{props.notesPanel}</div>
        )}
      </div>

      {props.tab === "entry" && props.showValue && props.revealValue ? (
        <div className="shrink-0 border-t border-grid-line bg-accent-soft/50 px-5 py-4">
          <CaseValueRevealLayout
            value={props.revealValue}
            representations={props.revealRepresentations}
            variant="accent"
          />
        </div>
      ) : null}
    </section>
  )
}