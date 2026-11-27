"use client"

import { HotkeyHintsLayout } from "@/core/hotkeys/hotkey_hints_layout"
import type { HotkeyBinding } from "@/core/hotkeys/hotkey_types"
import { createContext, useCallback, useContext, useState, type ReactNode } from "react"

type HotkeyHintsContextValue = {
  readonly setBindings: (bindings: readonly HotkeyBinding[]) => void
}

const hotkeyHintsContext = createContext<HotkeyHintsContextValue | null>(null)

export function HotkeyHintsProvider({ children }: { readonly children: ReactNode }) {
  const [bindings, setBindingsState] = useState<readonly HotkeyBinding[]>([])

  const setBindings = useCallback((next: readonly HotkeyBinding[]) => {
    setBindingsState(next)
  }, [])

  return (
    <hotkeyHintsContext.Provider value={{ setBindings }}>
      {children}
      <HotkeyHintsLayout bindings={bindings} />
    </hotkeyHintsContext.Provider>
  )
}

export function useSetHotkeyBindings(): HotkeyHintsContextValue["setBindings"] {
  const value = useContext(hotkeyHintsContext)
  if (!value) {
    throw new Error("useSetHotkeyBindings must run under HotkeyHintsProvider")
  }
  return value.setBindings
}