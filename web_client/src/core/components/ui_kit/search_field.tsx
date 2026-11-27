import { uiSearchFieldClassName } from "@/core/components/ui_kit/control_styles"
import { mergeClassNames } from "@/core/utils/merge_class_names"

type SearchFieldProps = {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly placeholder: string
  readonly className?: string
  readonly autoComplete?: string
}

export function SearchField({
  value,
  onChange,
  placeholder,
  className,
  autoComplete = "off",
}: SearchFieldProps) {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className={mergeClassNames(uiSearchFieldClassName, className)}
    />
  )
}