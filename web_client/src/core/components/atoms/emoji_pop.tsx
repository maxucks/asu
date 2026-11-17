import { EmojiPicker as Frimousse } from "frimousse"
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react"
import { createPortal } from "react-dom"

const PANEL_WIDTH = 288
const PANEL_HEIGHT = 304
const VIEWPORT_MARGIN = 8

type AnchorPosition = {
  readonly top: number
  readonly left: number
}

function useAnchorPosition(
  anchorRef: RefObject<HTMLElement | null>,
  active: boolean,
): AnchorPosition | null {
  const [position, setPosition] = useState<AnchorPosition | null>(null)

  useLayoutEffect(() => {
    if (!active) {
      setPosition(null)
      return
    }

    function update() {
      const anchor = anchorRef.current
      if (!anchor) return

      const rect = anchor.getBoundingClientRect()
      const gap = 4
      const spaceBelow = window.innerHeight - rect.bottom
      const openAbove = spaceBelow < PANEL_HEIGHT + gap && rect.top > PANEL_HEIGHT + gap

      const top = openAbove ? rect.top - PANEL_HEIGHT - gap : rect.bottom + gap
      let left = rect.right - PANEL_WIDTH
      left = Math.max(VIEWPORT_MARGIN, Math.min(left, window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN))

      setPosition({ top, left })
    }

    update()
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [active, anchorRef])

  return position
}

export function EmojiPop({
  anchorRef,
  onPick,
  onClose,
}: {
  readonly anchorRef: RefObject<HTMLElement | null>
  readonly onPick: (emoji: string) => void
  readonly onClose: () => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const position = useAnchorPosition(anchorRef, true)

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const root = rootRef.current
      const anchor = anchorRef.current
      const target = event.target as Node
      if (root?.contains(target) || anchor?.contains(target)) return
      onClose()
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", onPointerDown)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [anchorRef, onClose])

  if (position === null || typeof document === "undefined") return null

  const panel = (
    <div
      ref={rootRef}
      className="fixed z-[60] w-72 rounded-lg border border-grid-line bg-card p-2 shadow-2xl"
      style={{ top: position.top, left: position.left }}
      role="dialog"
      aria-label="Emoji picker"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Frimousse.Root className="isolate flex h-72 w-full flex-col gap-2" onEmojiSelect={({ emoji }) => onPick(emoji)}>
        <Frimousse.Search
          placeholder="Search emoji…"
          className="w-full rounded-md border border-grid-line bg-tile px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <Frimousse.Viewport className="min-h-0 flex-1 outline-hidden">
          <Frimousse.Loading className="flex flex-1 items-center justify-center text-xs text-muted">Loading…</Frimousse.Loading>
          <Frimousse.Empty className="flex flex-1 items-center justify-center text-xs text-muted">No emoji found.</Frimousse.Empty>
          <Frimousse.List
            className="select-none pb-1"
            components={{
              CategoryHeader: ({ category, ...props }) => (
                <div
                  {...props}
                  className="sticky top-0 z-10 bg-card px-1 pt-2 pb-1 text-[10px] font-medium tracking-wide text-muted uppercase"
                >
                  {category.label}
                </div>
              ),
              Row: ({ children, ...props }) => (
                <div {...props} className="flex gap-0.5 px-0.5">
                  {children}
                </div>
              ),
              Emoji: ({ emoji, ...props }) => (
                <button
                  {...props}
                  type="button"
                  title={emoji.label}
                  onMouseDown={(event) => event.preventDefault()}
                  className="flex size-8 items-center justify-center rounded-md text-lg hover:bg-tile data-[active]:bg-accent-soft"
                >
                  {emoji.emoji}
                </button>
              ),
            }}
          />
        </Frimousse.Viewport>
      </Frimousse.Root>
    </div>
  )

  return createPortal(panel, document.body)
}