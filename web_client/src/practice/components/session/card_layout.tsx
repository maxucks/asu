import type { AssocRow } from "@/practice/components/assoc/list_layout"
import { AssocListLayout } from "@/practice/components/assoc/list_layout"
import { CaseFieldsLayout } from "@/practice/components/case/fields_layout"
import { ToolbarLayout } from "@/practice/components/session/toolbar_layout"
import { StudyPetBadge } from "@/practice/components/session/study_pet_badge"
import { levelGlowShadow } from "@/practice/practice_level_visual"
import type { StudyRecordSnapshotDto } from "@/practice/practice_study_types"
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
  readonly sortable?: boolean
  readonly onReorder?: (associationIds: readonly string[]) => void
  readonly caseCategories?: ReactNode
  readonly studyRecord?: StudyRecordSnapshotDto | null
}

export function CardLayout(props: CardLayoutProps) {
  const level = props.studyRecord?.level ?? 0
  const glow = levelGlowShadow(level)

  return (
    <section
      className={`flex h-full min-h-[min(70vh,560px)] flex-col overflow-hidden rounded-2xl border border-grid-line bg-card transition-shadow duration-300 ${props.flat ? "" : "shadow-lg"}`}
      style={{ boxShadow: glow }}
    >
      <div className="space-y-3 border-b border-grid-line px-5 py-5">
        <div className="flex items-start gap-3">
          {props.studyRecord ? (
            <StudyPetBadge level={props.studyRecord.level} points={props.studyRecord.points} />
          ) : null}
          <div className="min-w-0 flex-1">
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
        </div>
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
        sortable={props.sortable}
        onReorder={props.onReorder}
      />

      {props.showLemma && props.revealLemma ? (
        <div className="border-t border-grid-line bg-accent-soft/50 px-5 py-4">
          <p className="text-2xl font-semibold tracking-tight text-accent">{props.revealLemma}</p>
        </div>
      ) : null}
    </section>
  )
}