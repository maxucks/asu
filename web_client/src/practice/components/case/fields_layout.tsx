import { TextArea, TextField } from "@/core/components/atoms/text_field"

type CaseFieldsLayoutProps = {
  readonly value: string
  readonly meaning: string
  readonly disabled?: boolean
  readonly onValue: (text: string) => void
  readonly onMeaning: (text: string) => void
}

export function CaseFieldsLayout({ value, meaning, disabled, onValue, onMeaning }: CaseFieldsLayoutProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-grid-line bg-tile p-3">
      <label className="flex flex-col gap-1 text-xs text-muted">
        Value
        <TextField value={value} disabled={disabled} onChange={(e) => onValue(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-muted">
        Description
        <TextArea value={meaning} disabled={disabled} rows={3} onChange={(e) => onMeaning(e.target.value)} />
      </label>
    </div>
  )
}