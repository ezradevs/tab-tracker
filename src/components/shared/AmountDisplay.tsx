import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"

interface AmountDisplayProps {
  amount: number
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  showSign?: boolean
  positive?: boolean
}

export function AmountDisplay({
  amount,
  className,
  size = "md",
  showSign = false,
  positive,
}: AmountDisplayProps) {
  const isPositive = positive ?? amount >= 0

  return (
    <span
      className={cn(
        "font-semibold tabular-nums",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-2xl",
        size === "xl" && "text-5xl font-bold tracking-tight",
        isPositive ? "text-positive" : "text-negative",
        className
      )}
    >
      {showSign && amount > 0 && "+"}
      {formatCurrency(Math.abs(amount))}
    </span>
  )
}
