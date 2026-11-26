const NOTE_PREVIEW_MAX_LINES = 3
const NOTE_PREVIEW_MAX_CHARS = 200

export function noteContentPreview(content: string): string {
  const trimmed = content.trim()
  if (trimmed.length === 0) return ""

  const lines = trimmed.split(/\r?\n/).slice(0, NOTE_PREVIEW_MAX_LINES)
  let preview = lines.join("\n")
  if (lines.length < trimmed.split(/\r?\n/).length) {
    preview = `${preview}\n…`
  }
  if (preview.length > NOTE_PREVIEW_MAX_CHARS) {
    preview = `${preview.slice(0, NOTE_PREVIEW_MAX_CHARS - 1)}…`
  }
  return preview
}