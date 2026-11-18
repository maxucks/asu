import { levelAccentCss } from "@/practice/practice_level_visual"

type StudyPetBadgeProps = {
  readonly level: number
  readonly points: number
}

export function StudyPetBadge({ level, points }: StudyPetBadgeProps) {
  const accent = levelAccentCss(level)
  const tier = Math.min(3, Math.max(0, Math.floor((level + 3) / 4)))
  const scale = 1 + tier * 0.06

  return (
    <svg
      className="block size-[52px] shrink-0 drop-shadow-md"
      viewBox="0 0 48 56"
      role="img"
      aria-label={`Level ${level}, ${points} points`}
    >
      <defs>
        <linearGradient id="pet-normal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#141414" />
        </linearGradient>
      </defs>
      <path
        d="M24 2 L42 10 V26 C42 40 34 52 24 54 C14 52 6 40 6 26 V10 Z"
        fill="url(#pet-normal)"
        stroke={accent}
        strokeWidth={1.75 + tier * 0.35}
      />
      <g transform={`translate(24 30) scale(${scale}) translate(-24 -30)`}>
        <ellipse cx="15" cy="24" rx="4.5" ry="5.5" fill="#0c0c0c" opacity="0.85" />
        <ellipse cx="33" cy="24" rx="4.5" ry="5.5" fill="#0c0c0c" opacity="0.85" />
        <path d="M8.5 12h1.5" stroke="#f0c419" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 12h1.5" stroke="#f0c419" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18 33 Q24 36 30 33" stroke="#9a9a9a" strokeWidth="1.25" fill="none" strokeLinecap="round" />
      </g>
      <text x="24" y="47" textAnchor="middle" className="fill-foreground text-[9px] font-bold" fontSize="9">
        L{level}
      </text>
      <text x="24" y="54" textAnchor="middle" className="fill-muted" fontSize="7">
        {points}pt
      </text>
    </svg>
  )
}