import type { AssocRow } from "@/practice/components/assoc/list_layout"
import { AssocListLayout } from "@/practice/components/assoc/list_layout"
import { CaseFieldsLayout } from "@/practice/components/case/fields_layout"
import { ToolbarLayout } from "@/practice/components/session/toolbar_layout"
import type { AssociationAddAction } from "@/practice/practice_utils"
import type { ReactNode } from "react"

export type CardLayoutProps = {
  readonly flat?: boolean
  readonly onFront: boolean
  readonly editingCase: boolean
  readonly caseSaving: boolean
  readonly showAdd: boolean
  readonly saving: boolean
  readonly lemma: string
  readonly meaning: string
  readonly cardMeaning?: string
  readonly revealLemma?: string
  readonly showLemma: boolean
  readonly rows: readonly AssocRow[]
  readonly addText: ReactNode
  readonly addUrl: ReactNode
  readonly onLemma: (v: string) => void
  readonly onMeaning: (v: string) => void
  readonly onCancelCase: () => void
  readonly onSaveCase: () => void
  readonly onEditCase: () => void
  readonly onDeleteCase: () => void
  readonly onPick: (action: AssociationAddAction) => void
}

export function CardLayout(props: CardLayoutProps) {
  return (
    <section
      className={`flex flex-1 flex-col overflow-hidden rounded-2xl border border-grid-line bg-card ${props.flat ? "" : "shadow-lg"}`}
    >
      <div className="space-y-3 border-b border-grid-line px-5 py-5">
        <ToolbarLayout
          onFront={props.onFront}
          editingCase={props.editingCase}
          caseSaving={props.caseSaving}
          onCancelCase={props.onCancelCase}
          onSaveCase={props.onSaveCase}
          onEditCase={props.onEditCase}
          onDeleteCase={props.onDeleteCase}
        />
        {props.editingCase ? (
          <CaseFieldsLayout
            lemma={props.lemma}
            meaning={props.meaning}
            disabled={props.caseSaving}
            onLemma={props.onLemma}
            onMeaning={props.onMeaning}
          />
        ) : props.cardMeaning ? (
          <p className="rounded-xl border border-grid-line bg-tile px-4 py-3 text-sm leading-relaxed text-foreground/90">{props.cardMeaning}</p>
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
      />

      {props.showLemma && props.revealLemma ? (
        <div className="border-t border-grid-line bg-accent-soft/50 px-5 py-4">
          <p className="text-2xl font-semibold tracking-tight text-accent">{props.revealLemma}</p>
        </div>
      ) : null}
    </section>
  )
}