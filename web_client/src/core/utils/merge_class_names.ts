export function mergeClassNames(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ")
}