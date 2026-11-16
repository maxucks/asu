import { TextField } from "@/core/components/atoms/text_field"
import { ComposeShellLayout, composeFieldClass } from "@/practice/components/assoc/compose_shell_layout"
import { useState } from "react"

export function AssocTextFormLayout(props: {
  readonly intent?: "add" | "edit"
  readonly initialValue?: string
  readonly saving?: boolean
  readonly onCancel: () => void
  readonly onSave: (text: string) => void
}) {
  const [text, setText] = useState(props.initialValue ?? "")
  const trimmed = text.trim()
  const edit = props.intent === "edit"

  return (
    <ComposeShellLayout
      title={edit ? "Edit text association" : "Text association"}
      saving={props.saving}
      submitDisabled={trimmed.length === 0}
      submitLabel={edit ? "Save" : "Add"}
      onCancel={props.onCancel}
      onSubmit={() => props.onSave(trimmed)}
    >
      <TextField type="text" value={text} disabled={props.saving} autoFocus placeholder="Your mnemonic or cue…" onChange={(e) => setText(e.target.value)} className={composeFieldClass} />
    </ComposeShellLayout>
  )
}