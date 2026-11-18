const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** Level-tone for card rim and badge gradient (red = struggling, gold = strong). */
export function levelAccentHsl(level: number): { h: number; s: number; l: number } {
  const t = clamp((level + 5) / 20, 0, 1)
  const h = 4 + t * 48
  const s = 55 + t * 25
  const l = 32 + t * 22
  return { h, s, l }
}

export function levelAccentCss(level: number): string {
  const { h, s, l } = levelAccentHsl(level)
  return `hsl(${h} ${s}% ${l}%)`
}

export function levelGlowShadow(level: number): string {
  const color = levelAccentCss(level)
  const intensity = clamp(0.15 + Math.abs(level) * 0.04, 0.12, 0.65)
  return `0 0 0 1px color-mix(in srgb, ${color} 45%, transparent), 0 0 20px color-mix(in srgb, ${color} ${Math.round(intensity * 100)}%, transparent)`
}