import { useState } from "react"
import { normalizeImageAssociationUrl } from "@/practice/practice_association"
import {
  AddAssociationComposeShellUi,
  associationComposeFieldClassName,
} from "@/practice/ui/add_association_compose_shell_ui"

type AddImageUrlAssociationUiProps = {
  readonly onCancel: () => void
  readonly onSave: (url: string) => void
  readonly saving?: boolean
  readonly initialValue?: string
  readonly intent?: "add" | "edit"
}

export function AddImageUrlAssociationUi({
  onCancel,
  onSave,
  saving,
  initialValue = "",
  intent = "add",
}: AddImageUrlAssociationUiProps) {
  const [raw, setRaw] = useState(initialValue)
  const normalized = normalizeImageAssociationUrl(raw)
  const showInvalid = raw.trim().length > 0 && normalized === null
  const editing = intent === "edit"

  return (
    <AddAssociationComposeShellUi
      title={editing ? "Edit image URL" : "Image from URL"}
      saving={saving}
      submitDisabled={normalized === null}
      submitLabel={editing ? "Save" : "Add"}
      onCancel={onCancel}
      onSubmit={() => {
        if (normalized) onSave(normalized)
      }}
      hint={
        showInvalid ? (
          <p className="text-xs text-danger">Enter a valid http or https URL.</p>
        ) : (
          <p className="text-xs text-slate-500">Tip: use “Copy image address” from your browser when possible.</p>
        )
      }
    >
      <input
        type="url"
        value={raw}
        disabled={saving}
        autoFocus
        placeholder="https://… (direct image link works best)"
        onChange={(event) => setRaw(event.target.value)}
        className={associationComposeFieldClassName}
      />
    </AddAssociationComposeShellUi>
  )
}
