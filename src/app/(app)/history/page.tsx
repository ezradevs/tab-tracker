"use client"

import { motion } from "framer-motion"
import { Banknote, Clock } from "lucide-react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useTransactions } from "@/hooks/useTransactions"
import { useSettlements } from "@/hooks/useSettlements"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageLoader } from "@/components/shared/LoadingSpinner"
import { SettlementItem } from "@/components/transactions/SettlementItem"

export default function HistoryPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const { transactions, loading: txLoading } = useTransactions(user?.groupId ?? null, user?.id ?? null)
  const { settlements, loading: settlLoading } = useSettlements(user?.groupId ?? null)

  if (userLoading || txLoading || settlLoading) return <PageLoader />
  if (!user) return null

  const ownerProfile = user.profile.role === "owner" ? user.profile : user.partnerProfile
  const mumProfile = user.profile.role === "mum" ? user.profile : user.partnerProfile

  const totalByOwner = transactions
    .filter((t) => t.payer_id === ownerProfile?.id)
    .reduce((s, t) => s + t.amount, 0)

  const totalByMum = transactions
    .filter((t) => t.payer_id === mumProfile?.id)
    .reduce((s, t) => s + t.amount, 0)

  const totalSettled = settlements.reduce((s, s2) => s + s2.amount, 0)

  const mumName = mumProfile?.display_name ?? "Mum"

  return (
    <div className="flex flex-col gap-5 p-4 pt-6">
      <h1 className="text-xl font-bold text-foreground">History</h1>

      {/* All-time stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "You paid", value: totalByOwner, color: "text-positive" },
          { label: `${mumName} paid`, value: totalByMum, color: "text-negative" },
          { label: "Total settled", value: totalSettled, color: "text-accent-foreground" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-surface border border-border p-3 text-center">
            <p className={`text-lg font-bold tabular-nums ${stat.color}`}>
              ${stat.value.toFixed(0)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Settlements list */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Settlements</h2>

        {settlements.length === 0 ? (
          <EmptyState
            icon={Banknote}
            title="No settlements yet"
            description="When you settle up, the history will appear here."
          />
        ) : (
          <div className="rounded-xl bg-surface border border-border overflow-hidden divide-y divide-border">
            {settlements.map((s, i) => {
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <SettlementItem settlement={s} user={user} />
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Transaction count */}
      <div className="rounded-xl bg-surface border border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">All time</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{settlements.length}</p>
            <p className="text-xs text-muted-foreground">Settlements</p>
          </div>
        </div>
      </div>
    </div>
  )
}
