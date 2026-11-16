import { EmojiPicker as Frimousse } from "frimousse"
import { useEffect, useRef } from "react"

export function EmojiPop({ onPick, onClose }: { readonly onPick: (emoji: string) => void; readonly onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const root = rootRef.current
      if (!root || root.contains(event.target as Node)) return
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
  }, [onClose])

  return (
    <div ref={rootRef} className="absolute top-full right-0 z-30 mt-1 w-72 rounded-lg border border-slate-600 bg-slate-900 p-2 shadow-xl" role="dialog" aria-label="Emoji picker" onMouseDown={(e) => e.stopPropagation()}>
      <Frimousse.Root className="isolate flex h-72 w-full flex-col gap-2" onEmojiSelect={({ emoji }) => onPick(emoji)}>
        <Frimousse.Search placeholder="Search emoji…" className="w-full rounded-md border border-slate-600 bg-slate-950 px-2.5 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none" />
        <Frimousse.Viewport className="min-h-0 flex-1 outline-hidden">
          <Frimousse.Loading className="flex flex-1 items-center justify-center text-xs text-slate-500">Loading…</Frimousse.Loading>
          <Frimousse.Empty className="flex flex-1 items-center justify-center text-xs text-slate-500">No emoji found.</Frimousse.Empty>
          <Frimousse.List
            className="select-none pb-1"
            components={{
              CategoryHeader: ({ category, ...props }) => (
                <div {...props} className="sticky top-0 z-10 bg-slate-900 px-1 pt-2 pb-1 text-[10px] font-medium tracking-wide text-slate-500 uppercase">{category.label}</div>
              ),
              Row: ({ children, ...props }) => <div {...props} className="flex gap-0.5 px-0.5">{children}</div>,
              Emoji: ({ emoji, ...props }) => (
                <button
                  {...props}
                  type="button"
                  title={emoji.label}
                  onMouseDown={(event) => event.preventDefault()}
                  className="flex size-8 items-center justify-center rounded-md text-lg hover:bg-slate-800 data-[active]:bg-slate-700"
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
}