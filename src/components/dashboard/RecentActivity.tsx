"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Transaction, Settlement, AppUser } from "@/types/database"
import { TransactionItem } from "@/components/transactions/TransactionItem"
import { SettlementItem } from "@/components/transactions/SettlementItem"

interface RecentActivityProps {
  transactions: Transaction[]
  settlements: Settlement[]
  user: AppUser
}

export function RecentActivity({ transactions, settlements, user }: RecentActivityProps) {
  // Merge and sort by date descending, take 5 most recent
  const combined = [
    ...transactions.map(t => ({ type: "transaction" as const, date: t.created_at, item: t })),
    ...settlements.map(s => ({ type: "settlement" as const, date: s.settled_at, item: s })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
        <Link href="/transactions" className="flex items-center gap-1 text-xs text-primary">
          See all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {combined.length === 0 ? (
        <div className="rounded-xl bg-surface border border-border py-8 text-center">
          <p className="text-sm text-muted-foreground">No activity yet</p>
        </div>
      ) : (
        <div className="rounded-xl bg-surface border border-border overflow-hidden divide-y divide-border">
          {combined.map((entry) =>
            entry.type === "transaction" ? (
              <TransactionItem key={entry.item.id} transaction={entry.item as Transaction} user={user} />
            ) : (
              <SettlementItem key={entry.item.id} settlement={entry.item as Settlement} user={user} />
            )
          )}
        </div>
      )}
    </div>
  )
}
