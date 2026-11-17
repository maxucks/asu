/** One user-perceived emoji (full grapheme cluster, e.g. 🇬🇧 or 👨‍👩‍👧). */
export function singleEmoji(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return ""

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })
    const first = [...segmenter.segment(trimmed)][0]
    return first?.segment ?? ""
  }

  return [...trimmed].slice(0, 2).join("")
}