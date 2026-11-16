import { TextField } from "@/core/components/atoms/text_field"
import { ComposeShellLayout, composeFieldClass } from "@/practice/components/assoc/compose_shell_layout"
import { normalizeImageAssociationUrl } from "@/practice/practice_utils"
import { useState } from "react"

export function AssocUrlFormLayout(props: {
  readonly intent?: "add" | "edit"
  readonly initialValue?: string
  readonly saving?: boolean
  readonly onCancel: () => void
  readonly onSave: (url: string) => void
}) {
  const [raw, setRaw] = useState(props.initialValue ?? "")
  const url = normalizeImageAssociationUrl(raw)
  const invalid = raw.trim().length > 0 && url === null
  const edit = props.intent === "edit"

  return (
    <ComposeShellLayout
      title={edit ? "Edit image URL" : "Image from URL"}
      saving={props.saving}
      submitDisabled={url === null}
      submitLabel={edit ? "Save" : "Add"}
      onCancel={props.onCancel}
      onSubmit={() => url && props.onSave(url)}
      hint={
        invalid ? (
          <p className="text-xs text-danger">Enter a valid http or https URL.</p>
        ) : (
          <p className="text-xs text-slate-500">Tip: use “Copy image address” from your browser when possible.</p>
        )
      }
    >
      <TextField type="url" value={raw} disabled={props.saving} autoFocus placeholder="https://…" onChange={(e) => setRaw(e.target.value)} className={composeFieldClass} />
    </ComposeShellLayout>
  )
}