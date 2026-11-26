type LibraryEmptyHintProps = {
  readonly message: string
  readonly hint?: string
}

export function LibraryEmptyHint({ message, hint }: LibraryEmptyHintProps) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-sm text-muted">{message}</p>
      {hint ? <p className="mt-2 text-xs text-muted/90">{hint}</p> : null}
    </div>
  )
}