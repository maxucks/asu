import { TextField } from "@/core/components/atoms/text_field"

type LanguageNameFieldProps = {
  readonly label?: string
  readonly value: string
  readonly onChange: (value: string) => void
  readonly placeholder?: string
  readonly disabled?: boolean
  readonly autoFocus?: boolean
}

export function LanguageNameField({
  label = "Name",
  value,
  onChange,
  placeholder = "Language name",
  disabled,
  autoFocus,
}: LanguageNameFieldProps) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-muted">
      {label}
      <TextField
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}