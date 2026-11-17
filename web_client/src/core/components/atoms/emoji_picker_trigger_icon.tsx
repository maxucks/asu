type EmojiPickerTriggerIconProps = {
  readonly className?: string
  readonly size?: number
}

/** Muted outline smiley — matches the insert-emoji control on text fields. */
export function EmojiPickerTriggerIcon({ className, size = 16 }: EmojiPickerTriggerIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
      className={className ?? "text-muted opacity-70"}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
      <path d="M9.5 15a4.5 4.5 0 0 0 5 0" />
    </svg>
  )
}

export function MutedMenuGlyph({ children }: { readonly children: string }) {
  return (
    <span aria-hidden className="select-none text-[17px] leading-none opacity-45 grayscale">
      {children}
    </span>
  )
}