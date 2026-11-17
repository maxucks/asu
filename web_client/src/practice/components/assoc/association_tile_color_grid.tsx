import {
  ASSOCIATION_TILE_COLOR_IDS,
  associationTileColorHex,
  type AssociationTileColorId,
} from "@/practice/association_tile_colors"

type AssociationTileColorGridProps = {
  readonly value: AssociationTileColorId
  readonly onPick: (id: AssociationTileColorId) => void
  readonly disabled?: boolean
}

export function AssociationTileColorGrid({ value, onPick, disabled }: AssociationTileColorGridProps) {
  return (
    <div role="radiogroup" aria-label="Tile color" className="grid grid-cols-3 gap-1.5">
      {ASSOCIATION_TILE_COLOR_IDS.map((id) => {
        const selected = id === value
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            title={id}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onPick(id)}
            className={`size-7 rounded-md border focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-40 ${
              selected
                ? "border-accent ring-1 ring-accent/60"
                : "border-grid-line [@media(hover:hover)]:hover:border-muted"
            }`}
            style={{ backgroundColor: associationTileColorHex(id) }}
          />
        )
      })}
    </div>
  )
}