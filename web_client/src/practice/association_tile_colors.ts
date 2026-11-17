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

/** Saturated dark tints — readable with `text-foreground` on association tiles. */
const TILE_COLOR_HEX: Record<AssociationTileColorId, string> = {
  ink: "#272a33",
  graphite: "#38323d",
  smoke: "#243650",
  moss: "#1f4d32",
  honey: "#5a4615",
  umber: "#5a3a1c",
  plum: "#4a2d5c",
  pine: "#1f4f47",
  ember: "#5c2a36",
}

export function isAssociationTileColorId(value: string): value is AssociationTileColorId {
  return (ASSOCIATION_TILE_COLOR_IDS as readonly string[]).includes(value)
}

export function associationTileColorHex(id: string | null | undefined): string {
  if (id && isAssociationTileColorId(id)) return TILE_COLOR_HEX[id]
  return TILE_COLOR_HEX[DEFAULT_ASSOCIATION_TILE_COLOR_ID]
}

export function normalizeAssociationTileColorId(id: string | null | undefined): AssociationTileColorId {
  if (id && isAssociationTileColorId(id)) return id
  return DEFAULT_ASSOCIATION_TILE_COLOR_ID
}

export function randomAssociationTileColorId(): AssociationTileColorId {
  const index = Math.floor(Math.random() * ASSOCIATION_TILE_COLOR_IDS.length)
  return ASSOCIATION_TILE_COLOR_IDS[index]!
}