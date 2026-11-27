"use client"

import type { HotkeyBinding } from "@/core/hotkeys/hotkey_types"

type HotkeyHintsLayoutProps = {
  readonly bindings: readonly HotkeyBinding[]
}

function HotkeyChip({ keyLabel }: { readonly keyLabel: string }) {
  const compact = keyLabel.length <= 1
  return (
    <kbd
      className={`inline-flex shrink-0 justify-center rounded-md border border-warn/55 bg-warn/15 py-0.5 font-mono text-[11px] font-semibold leading-none text-warn ${
        compact ? "min-w-[1.35rem] px-1.5" : "min-w-[2.5rem] px-2"
      }`}
    >
      {keyLabel}
    </kbd>
  )
}

export function HotkeyHintsLayout({ bindings }: HotkeyHintsLayoutProps) {
  if (bindings.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-40"
      aria-label="Keyboard shortcuts"
    >
      <ul
        className="grid list-none items-center gap-x-2 gap-y-1.5 text-xs leading-none"
        style={{ gridTemplateColumns: "auto auto" }}
      >
        {bindings.map((binding) => (
          <li key={binding.id} className="contents">
            <div className="flex items-center justify-end gap-1">
              {binding.keys.map((keyLabel, index) => (
                <HotkeyChip key={`${binding.id}-${index}`} keyLabel={keyLabel} />
              ))}
            </div>
            <span className="text-warn">{binding.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}