const CASE_DESCRIPTION_SEP = " : "

/**
 * One seed line: `Lemma with (reading) : English description`
 * Text in parentheses is part of the case (lemma), not the description.
 */
export function parseJapaneseCaseLine(line: string): { value: string; meaning: string } | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) return null

  const sep = trimmed.indexOf(CASE_DESCRIPTION_SEP)
  if (sep === -1) return null

  const value = trimmed.slice(0, sep).trim()
  const meaning = trimmed.slice(sep + CASE_DESCRIPTION_SEP.length).trim()
  if (!value || !meaning) return null

  return { value, meaning }
}

export function parseJapaneseCaseLines(block: string): { value: string; meaning: string }[] {
  return block
    .split("\n")
    .map(parseJapaneseCaseLine)
    .filter((row): row is { value: string; meaning: string } => row !== null)
}