"use client";

import { useState } from "react";

type AddTextAssociationUiProps = {
  readonly onCancel: () => void;
  readonly onSave: (text: string) => void;
  readonly saving?: boolean;
};

export function AddTextAssociationUi({
  onCancel,
  onSave,
  saving,
}: AddTextAssociationUiProps) {
  const [text, setText] = useState("");

  return (
    <form
      className="flex flex-col gap-2 rounded-lg border border-slate-600 bg-slate-800/80 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(text);
      }}
    >
      <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Text association
      </label>
      <input
        type="text"
        value={text}
        disabled={saving}
        autoFocus
        placeholder="Your mnemonic or cue…"
        onChange={(event) => setText(event.target.value)}
        className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[var(--accent)] focus:outline-none"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || text.trim().length === 0}
          className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
        >
          {saving ? "Saving…" : "Add"}
        </button>
      </div>
    </form>
  );
}
