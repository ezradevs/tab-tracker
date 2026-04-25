"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PayerToggleProps {
  value: "owner" | "mum"
  onChange: (v: "owner" | "mum") => void
  ownerLabel?: string
  mumLabel?: string
}

export function PayerToggle({ value, onChange, ownerLabel = "You", mumLabel = "Mum" }: PayerToggleProps) {
  return (
    <div className="relative flex rounded-xl bg-elevated p-1">
      <motion.div
        layout
        className="absolute inset-1 rounded-lg bg-primary shadow-sm"
        style={{
          width: "calc(50% - 4px)",
          x: value === "owner" ? 0 : "calc(100% + 8px)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
      />
      <button
        type="button"
        onClick={() => onChange("owner")}
        className={cn(
          "relative z-10 flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
          value === "owner" ? "text-white" : "text-muted-foreground"
        )}
      >
        {ownerLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange("mum")}
        className={cn(
          "relative z-10 flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
          value === "mum" ? "text-white" : "text-muted-foreground"
        )}
      >
        {mumLabel}
      </button>
    </div>
  )
}
