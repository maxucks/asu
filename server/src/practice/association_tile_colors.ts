export const ASSOCIATION_TILE_COLOR_IDS = [
  "ink",
  "graphite",
  "smoke",
  "moss",
  "honey",
  "umber",
  "plum",
  "pine",
  "ember",
] as const

export type AssociationTileColorId = (typeof ASSOCIATION_TILE_COLOR_IDS)[number]

export const DEFAULT_ASSOCIATION_TILE_COLOR_ID: AssociationTileColorId = "ink"

export function isAssociationTileColorId(value: string): value is AssociationTileColorId {
  return (ASSOCIATION_TILE_COLOR_IDS as readonly string[]).includes(value)
}