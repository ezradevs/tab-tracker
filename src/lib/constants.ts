import {
  ShoppingCart,
  Bus,
  Zap,
  UtensilsCrossed,
  Home,
  MoreHorizontal,
} from "lucide-react"

export const CATEGORIES = [
  { value: "groceries", label: "Groceries", icon: ShoppingCart, color: "#10b981" },
  { value: "transport", label: "Transport", icon: Bus, color: "#3b82f6" },
  { value: "bills", label: "Bills", icon: Zap, color: "#f59e0b" },
  { value: "dining", label: "Dining", icon: UtensilsCrossed, color: "#ef4444" },
  { value: "household", label: "Household", icon: Home, color: "#a78bfa" },
  { value: "other", label: "Other", icon: MoreHorizontal, color: "#8b7da8" },
] as const

export type CategoryValue = (typeof CATEGORIES)[number]["value"]

export function getCategoryMeta(value: string) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1]
}
