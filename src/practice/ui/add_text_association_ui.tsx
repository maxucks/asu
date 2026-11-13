"use client";

import { useState } from "react";
import {
  AddAssociationComposeShellUi,
  associationComposeFieldClassName,
} from "@/practice/ui/add_association_compose_shell_ui";

type AddTextAssociationUiProps = {
  readonly onCancel: () => void;
  readonly onSave: (text: string) => void;
  readonly saving?: boolean;
  readonly initialValue?: string;
  readonly intent?: "add" | "edit";
};

export function AddTextAssociationUi({
  onCancel,
  onSave,
  saving,
  initialValue = "",
  intent = "add",
}: AddTextAssociationUiProps) {
  const [text, setText] = useState(initialValue);
  const trimmed = text.trim();
  const editing = intent === "edit";

  return (
    <AddAssociationComposeShellUi
      title={editing ? "Edit text association" : "Text association"}
      saving={saving}
      submitDisabled={trimmed.length === 0}
      submitLabel={editing ? "Save" : "Add"}
      onCancel={onCancel}
      onSubmit={() => onSave(trimmed)}
    >
      <input
        type="text"
        value={text}
        disabled={saving}
        autoFocus
        placeholder="Your mnemonic or cue…"
        onChange={(event) => setText(event.target.value)}
        className={associationComposeFieldClassName}
      />
    </AddAssociationComposeShellUi>
  );
}
