export function insertTextAtCaret(
  value: string,
  selectionStart: number | null,
  selectionEnd: number | null,
  insertion: string,
): { nextValue: string; caret: number } {
  const start = selectionStart ?? value.length
  const end = selectionEnd ?? value.length
  const nextValue = value.slice(0, start) + insertion + value.slice(end)
  return { nextValue, caret: start + insertion.length }
}