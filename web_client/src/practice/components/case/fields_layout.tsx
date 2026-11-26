import { TextArea, TextField } from "@/core/components/atoms/text_field"
import { formatRepresentationTypeLabel } from "@/practice/practice_representation"
import type { RepresentationTypeDto } from "@/core/data_sources/http_representation_type_data_source"

export type CaseRepresentationFieldProps = {
  readonly type: RepresentationTypeDto
  readonly value: string
  readonly disabled?: boolean
  readonly onChange: (text: string) => void
}

type CaseFieldsLayoutProps = {
  readonly value: string
  readonly meaning: string
  readonly disabled?: boolean
  readonly onValue: (text: string) => void
  readonly onMeaning: (text: string) => void
  readonly representationTypes?: readonly RepresentationTypeDto[]
  readonly representationDrafts?: Record<number, string>
  readonly onRepresentationDraft?: (typeId: number, text: string) => void
}

export function CaseFieldsLayout({
  value,
  meaning,
  disabled,
  onValue,
  onMeaning,
  representationTypes = [],
  representationDrafts = {},
  onRepresentationDraft,
}: CaseFieldsLayoutProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-grid-line bg-tile p-3">
      <label className="flex flex-col gap-1 text-xs text-muted">
        Value
        <TextField value={value} disabled={disabled} onChange={(e) => onValue(e.target.value)} />
      </label>
      {representationTypes.map((type) => (
        <label key={type.id} className="flex flex-col gap-1 text-xs text-muted">
          {formatRepresentationTypeLabel(type.name)}
          <TextField
            value={representationDrafts[type.id] ?? ""}
            disabled={disabled}
            onChange={(e) => onRepresentationDraft?.(type.id, e.target.value)}
          />
        </label>
      ))}
      <label className="flex flex-col gap-1 text-xs text-muted">
        Description
        <TextArea value={meaning} disabled={disabled} rows={3} onChange={(e) => onMeaning(e.target.value)} />
      </label>
    </div>
  )
}