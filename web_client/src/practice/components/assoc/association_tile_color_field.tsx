import { AssociationTileColorPop, associationTileColorSwatchStyle } from "@/practice/components/assoc/association_tile_color_pop"
import type { AssociationTileColorId } from "@/practice/association_tile_colors"
import { useRef, useState } from "react"

export function AssociationTileColorField({
  value,
  onChange,
  disabled,
}: {
  readonly value: AssociationTileColorId
  readonly onChange: (id: AssociationTileColorId) => void
  readonly disabled?: boolean
}) {
  const anchorRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        disabled={disabled}
        aria-label="Tile color"
        aria-expanded={open}
        title="Pick tile color"
        onClick={(event) => {
          event.stopPropagation()
          if (disabled) return
          setOpen((current) => !current)
        }}
        className="size-9 shrink-0 rounded-full border border-grid-line ring-offset-2 ring-offset-tile transition hover:border-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-40"
        style={associationTileColorSwatchStyle(value)}
      />
      {open && !disabled ? (
        <AssociationTileColorPop
          anchorRef={anchorRef}
          value={value}
          onPick={onChange}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  )
}