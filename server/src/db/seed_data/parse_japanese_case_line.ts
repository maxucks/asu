const CASE_DESCRIPTION_SEP = " : "

/**
 * One seed line: `Lemma with (reading) : English description`
 * Text in parentheses is part of the case (lemma), not the description.
 */
export function parseJapaneseCaseLine(line: string): { lemmaText: string; meaning: string } | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) return null

  const sep = trimmed.indexOf(CASE_DESCRIPTION_SEP)
  if (sep === -1) return null

  const lemmaText = trimmed.slice(0, sep).trim()
  const meaning = trimmed.slice(sep + CASE_DESCRIPTION_SEP.length).trim()
  if (!lemmaText || !meaning) return null

  return { lemmaText, meaning }
}

export function parseJapaneseCaseLines(block: string): { lemmaText: string; meaning: string }[] {
  return block
    .split("\n")
    .map(parseJapaneseCaseLine)
    .filter((row): row is { lemmaText: string; meaning: string } => row !== null)
}