import { TextArea, TextField } from "@/core/components/atoms/text_field"

type CaseFieldsLayoutProps = {
  readonly lemma: string
  readonly meaning: string
  readonly disabled?: boolean
  readonly onLemma: (value: string) => void
  readonly onMeaning: (value: string) => void
}

export function CaseFieldsLayout({ lemma, meaning, disabled, onLemma, onMeaning }: CaseFieldsLayoutProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-600/80 bg-slate-900/40 p-3">
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        Lemma
        <TextField value={lemma} disabled={disabled} onChange={(e) => onLemma(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        Description
        <TextArea value={meaning} disabled={disabled} rows={3} onChange={(e) => onMeaning(e.target.value)} />
      </label>
    </div>
  )
}