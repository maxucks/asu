import { EmojiPop } from "@/core/components/atoms/emoji_pop"
import { singleEmoji } from "@/core/utils/single_emoji"
import { useCallback, useRef, useState } from "react"

type EmojiIconPickerProps = {
  readonly value: string
  readonly onPick: (emoji: string) => void
  readonly disabled?: boolean
  readonly busy?: boolean
  readonly ariaLabel: string
  readonly className?: string
  readonly variant?: "default" | "compact"
}

const variantClass = {
  default: "size-11 text-2xl hover:border-accent/40 hover:bg-tile",
  compact: "size-9 text-xl hover:border-muted hover:bg-tile",
} as const

export function EmojiIconPicker({
  value,
  onPick,
  disabled,
  busy,
  ariaLabel,
  className,
  variant = "default",
}: EmojiIconPickerProps) {
  const anchorRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  const handlePick = useCallback(
    (raw: string) => {
      const emoji = singleEmoji(raw)
      if (emoji.length === 0) return
      onPick(emoji)
      setOpen(false)
    },
    [onPick],
  )

  const inactive = disabled || busy

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        disabled={inactive}
        aria-label={ariaLabel}
        aria-expanded={open}
        title="Change icon"
        onClick={(event) => {
          event.stopPropagation()
          if (inactive) return
          setOpen((current) => !current)
        }}
        className={
          className ??
          `flex shrink-0 items-center justify-center rounded-lg border border-grid-line bg-tile transition disabled:opacity-40 ${variantClass[variant]}`
        }
      >
        <span aria-hidden>{singleEmoji(value) || "🌐"}</span>
      </button>
      {open && !inactive ? (
        <EmojiPop anchorRef={anchorRef} onPick={handlePick} onClose={() => setOpen(false)} />
      ) : null}
    </>
  )
}