import { AssociationTileColorGrid } from "@/practice/components/assoc/association_tile_color_grid"
import type { AssociationTileColorId } from "@/practice/association_tile_colors"

/** Inline 3×3 grid (e.g. tests or rare embeds). Prefer {@link AssociationTileColorField} in forms. */
export function AssociationTileColorPicker({
  value,
  onChange,
  disabled,
}: {
  readonly value: AssociationTileColorId
  readonly onChange: (id: AssociationTileColorId) => void
  readonly disabled?: boolean
}) {
  return <AssociationTileColorGrid value={value} onPick={onChange} disabled={disabled} />
}