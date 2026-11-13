import { normalizeImageAssociationUrl } from "./image_url"

export function parsePracticeAssociationText(raw: string): string | null {
  const text = raw.trim()
  return text.length > 0 ? text : null
}

export function parsePracticeImageAssociationUrl(raw: string): string | null {
  return normalizeImageAssociationUrl(raw)
}
