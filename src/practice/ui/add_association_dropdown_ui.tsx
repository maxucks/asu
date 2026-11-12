"use client";

import { useState } from "react";
import {
  ASSOCIATION_KINDS,
  type AssociationKind,
} from "@/core/data_sources/case_data_source";

type AddAssociationDropdownUiProps = {
  readonly disabled?: boolean;
  readonly onPick: (kind: AssociationKind) => void;
};

const KIND_LABELS: Record<AssociationKind, string> = {
  text: "Text mnemonic",
  image: "Image (stub)",
  audio: "Audio (stub)",
  sketch: "Sketch (stub)",
  video: "Video (stub)",
};

export function AddAssociationDropdownUi({
  disabled,
  onPick,
}: AddAssociationDropdownUiProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-750 disabled:opacity-40"
      >
        + Add association
      </button>
      {open && !disabled ? (
        <ul
          className="absolute right-0 z-10 mt-2 min-w-[12rem] overflow-hidden rounded-lg border border-slate-600 bg-slate-900 shadow-xl"
          role="menu"
        >
          {ASSOCIATION_KINDS.map((kind) => (
            <li key={kind} role="none">
              <button
                type="button"
                role="menuitem"
                className="block w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-800"
                onClick={() => {
                  onPick(kind);
                  setOpen(false);
                }}
              >
                {KIND_LABELS[kind]}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
