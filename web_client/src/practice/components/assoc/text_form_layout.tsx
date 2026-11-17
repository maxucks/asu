import { TextField } from "@/core/components/atoms/text_field"
import { AssociationTileColorField } from "@/practice/components/assoc/association_tile_color_field"
import { ComposeShellLayout, composeFieldClass } from "@/practice/components/assoc/compose_shell_layout"
import {
  normalizeAssociationTileColorId,
  randomAssociationTileColorId,
  type AssociationTileColorId,
} from "@/practice/association_tile_colors"
import { useState } from "react"

export type AssocTextFormPayload = {
  readonly text: string
  readonly tileColor: AssociationTileColorId
}

export function AssocTextFormLayout(props: {
  readonly intent?: "add" | "edit"
  readonly initialValue?: string
  readonly initialTileColor?: string | null
  readonly saving?: boolean
  readonly onCancel: () => void
  readonly onSave: (payload: AssocTextFormPayload) => void
}) {
  const [text, setText] = useState(props.initialValue ?? "")
  const [tileColor, setTileColor] = useState<AssociationTileColorId>(() => {
    if (props.intent === "edit" || props.initialTileColor != null) {
      return normalizeAssociationTileColorId(props.initialTileColor)
    }
    return randomAssociationTileColorId()
  })
  const trimmed = text.trim()
  const edit = props.intent === "edit"

  return (
    <ComposeShellLayout
      title={edit ? "Edit text association" : "Text association"}
      saving={props.saving}
      submitDisabled={trimmed.length === 0}
      submitLabel={edit ? "Save" : "Add"}
      onCancel={props.onCancel}
      onSubmit={() => props.onSave({ text: trimmed, tileColor })}
    >
      <label className="flex flex-col gap-1 text-xs font-medium text-muted">
        Text
        <div className="flex items-center gap-2">
          <AssociationTileColorField value={tileColor} disabled={props.saving} onChange={setTileColor} />
          <TextField
            type="text"
            value={text}
            disabled={props.saving}
            autoFocus
            placeholder="Your mnemonic or cue…"
            onChange={(e) => setText(e.target.value)}
            className={`${composeFieldClass} min-w-0 flex-1`}
          />
        </div>
      </label>
    </ComposeShellLayout>
  )
}