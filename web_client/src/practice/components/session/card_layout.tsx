import type { AssocRow } from "@/practice/components/assoc/list_layout"
import { AssocListLayout } from "@/practice/components/assoc/list_layout"
import { CaseFieldsLayout } from "@/practice/components/case/fields_layout"
import { ToolbarLayout } from "@/practice/components/session/toolbar_layout"
import type { AssociationAddAction } from "@/practice/practice_utils"
import type { ReactNode } from "react"

export type CardLayoutProps = {
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
    <section className="flex flex-1 flex-col gap-4 rounded-2xl border border-slate-700/80 bg-card p-5 shadow-lg">
      <ToolbarLayout
        onFront={props.onFront}
        editingCase={props.editingCase}
        caseSaving={props.caseSaving}
        showAdd={props.showAdd}
        saving={props.saving}
        onCancelCase={props.onCancelCase}
        onSaveCase={props.onSaveCase}
        onEditCase={props.onEditCase}
        onDeleteCase={props.onDeleteCase}
        onPick={props.onPick}
      />
      {props.addText}
      {props.addUrl}
      {props.editingCase ? (
        <CaseFieldsLayout lemma={props.lemma} meaning={props.meaning} disabled={props.caseSaving} onLemma={props.onLemma} onMeaning={props.onMeaning} />
      ) : props.cardMeaning ? (
        <p className="text-sm leading-relaxed text-slate-300">{props.cardMeaning}</p>
      ) : null}
      <h2 className="sr-only">Associations</h2>
      <AssocListLayout rows={props.rows} />
      {props.showLemma && props.revealLemma ? (
        <div className="rounded-xl border border-accent-soft bg-accent-soft/40 px-4 py-4">
          <p className="text-2xl font-semibold tracking-tight text-white">{props.revealLemma}</p>
        </div>
      ) : null}
    </section>
  )
}