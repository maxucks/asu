import type { ButtonHTMLAttributes, ReactNode } from "react"

type PrimaryActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly children: ReactNode
  readonly size?: "default" | "compact"
}

const sizeClassName: Record<NonNullable<PrimaryActionButtonProps["size"]>, string> = {
  default: "rounded-xl px-4 py-3.5 text-base",
  compact: "h-9 rounded-lg px-3 text-sm",
}

export function PrimaryActionButton({
  children,
  size = "default",
  className,
  type = "button",
  ...rest
}: PrimaryActionButtonProps) {
  return (
    <button
      type={type}
      className={`w-full bg-accent font-semibold text-accent-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClassName[size]} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </button>
  )
}