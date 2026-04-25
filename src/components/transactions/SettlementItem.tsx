"use client"

import { Banknote } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { Settlement, AppUser } from "@/types/database"

interface SettlementItemProps {
  settlement: Settlement
  user: AppUser
}

export function SettlementItem({ settlement, user }: SettlementItemProps) {
  const viewerPaid = settlement.payer_id === user.id
  const otherName = user.partnerProfile?.display_name ?? (user.profile.role === "owner" ? "Mum" : "Ezra")
  const label = viewerPaid ? `You paid ${otherName}` : `${otherName} paid you`

  return (
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
    </div>
  )
}
