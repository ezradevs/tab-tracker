"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Banknote, MoreHorizontal, Trash2 } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { Settlement, AppUser } from "@/types/database"

interface SettlementItemProps {
  settlement: Settlement
  user: AppUser
  onDelete?: (id: string) => Promise<void> | void
}

export function SettlementItem({ settlement, user, onDelete }: SettlementItemProps) {
  const [showActions, setShowActions] = useState(false)
  const viewerPaid = settlement.payer_id === user.id
  const otherName = user.partnerProfile?.display_name ?? (user.profile.role === "owner" ? "Mum" : "Ezra")
  const label = viewerPaid ? `You paid ${otherName}` : `${otherName} paid you`

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-end gap-2 bg-background/95 backdrop-blur-sm px-4"
          >
            {onDelete && (
              <button
                onClick={() => { onDelete(settlement.id); setShowActions(false) }}
                className="flex items-center gap-1.5 rounded-lg bg-destructive/15 px-3 py-2 text-xs font-medium text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}
            <button
              onClick={() => setShowActions(false)}
              className="text-xs text-muted-foreground px-2 py-2"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center">
        <div className="flex flex-1 items-center gap-3 pl-4 pr-2 py-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <Banknote className="h-4 w-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Payment</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {formatDate(settlement.settled_at.split("T")[0])}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          </div>

          <span className={cn(
            "text-sm font-semibold tabular-nums",
            viewerPaid ? "text-negative" : "text-positive"
          )}>
            {viewerPaid ? "-" : "+"}{formatCurrency(settlement.amount)}
          </span>
        </div>

        {onDelete && (
          <button
            onClick={() => setShowActions(true)}
            className="flex h-full items-center px-3 py-3.5 text-muted-foreground active:text-foreground transition-colors"
            aria-label="Options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
