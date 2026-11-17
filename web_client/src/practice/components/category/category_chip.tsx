import { categoryChipClassName, type CategoryChipSize } from "@/practice/components/category/category_chip_styles"
import type { ReactNode } from "react"

export { categoryChipClassName, categoryAddButtonClassName } from "@/practice/components/category/category_chip_styles"

export function CategoryChip({
  children,
  size = "default",
}: {
  readonly children: ReactNode
  readonly size?: CategoryChipSize
}) {
  return <span className={categoryChipClassName(size)}>{children}</span>
}