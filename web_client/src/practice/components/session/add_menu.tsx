import { ASSOCIATION_ADD_MENU, type AssociationAddAction } from "@/practice/practice_utils"
import { useState } from "react"

export type { AssociationAddAction } from "@/practice/practice_utils"

export function AddMenu({ disabled, onPick }: { readonly disabled?: boolean; readonly onPick: (pick: AssociationAddAction) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-700 disabled:opacity-40"
      >
        + Add association
      </button>
      {open && !disabled ? (
        <ul className="absolute right-0 z-10 mt-2 max-h-dropdown min-w-56 overflow-y-auto rounded-lg border border-slate-600 bg-slate-900 shadow-xl" role="menu">
          {ASSOCIATION_ADD_MENU.map((item) => (
            <li key={item.label} role="none">
              <button
                type="button"
                role="menuitem"
                className="block w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-800"
                onClick={() => {
                  onPick(item.pick)
                  setOpen(false)
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}