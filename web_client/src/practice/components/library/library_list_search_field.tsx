import { SearchField } from "@/core/components/ui_kit/search_field"

type LibraryListSearchFieldProps = {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly placeholder: string
  readonly className?: string
}

export function LibraryListSearchField(props: LibraryListSearchFieldProps) {
  return <SearchField {...props} />
}