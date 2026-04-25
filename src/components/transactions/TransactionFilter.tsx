"use client"

import { cn } from "@/lib/utils"

export type FilterValue = "unsettled" | "all"

interface TransactionFilterProps {
  value: FilterValue
  onChange: (v: FilterValue) => void
  unsettledCount: number
}

const options: { value: FilterValue; label: string }[] = [
  { value: "unsettled", label: "Unsettled" },
  { value: "all", label: "All" },
]

export function TransactionFilter({ value, onChange, unsettledCount }: TransactionFilterProps) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
            value === opt.value
              ? "bg-primary text-white"
              : "bg-elevated text-muted-foreground"
          )}
        >
          {opt.label}
          {opt.value === "unsettled" && unsettledCount > 0 && (
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                value === "unsettled" ? "bg-white/20 text-white" : "bg-border text-muted-foreground"
              )}
            >
              {unsettledCount > 99 ? "99+" : unsettledCount}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
