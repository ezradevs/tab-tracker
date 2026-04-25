"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Receipt } from "lucide-react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useTransactions } from "@/hooks/useTransactions"
import { useSettlements } from "@/hooks/useSettlements"
import { TransactionItem } from "@/components/transactions/TransactionItem"
import { SettlementItem } from "@/components/transactions/SettlementItem"
import { TransactionFilter, type FilterValue } from "@/components/transactions/TransactionFilter"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageLoader } from "@/components/shared/LoadingSpinner"
import Link from "next/link"

export default function TransactionsPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const {
    transactions,
    loading: txLoading,
    deleteTransaction,
    markSettled,
    reopenSettlementTransactions,
  } = useTransactions(
    user?.groupId ?? null,
    user?.id ?? null
  )
  const { settlements, loading: settlLoading, deleteSettlement } = useSettlements(user?.groupId ?? null)
  const [filter, setFilter] = useState<FilterValue>("unsettled")

  if (userLoading || txLoading || settlLoading) return <PageLoader />
  if (!user) return null

  const handleDeleteSettlement = async (settlementId: string) => {
    const result = await deleteSettlement(settlementId)
    if ("error" in result && result.error) return

    await reopenSettlementTransactions(settlementId)
  }

  const filtered = filter === "unsettled"
    ? transactions.filter((t) => !t.is_settled)
    : transactions

  const unsettledCount = transactions.filter((t) => !t.is_settled).length

  return (
    <div className="flex flex-col gap-4 p-4 pt-6">
      <h1 className="text-xl font-bold text-foreground">Transactions</h1>

      <TransactionFilter value={filter} onChange={setFilter} unsettledCount={unsettledCount} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={filter === "unsettled" ? "All settled up!" : "No transactions yet"}
          description={
            filter === "unsettled"
              ? "There are no outstanding items."
              : "Add your first transaction using the + button."
          }
          action={
            filter === "unsettled" ? undefined : (
              <Link
                href="/add"
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white"
              >
                Add transaction
              </Link>
            )
          }
        />
      ) : (
        <div className="rounded-xl bg-surface border border-border overflow-hidden divide-y divide-border">
          {filtered.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              <TransactionItem
                transaction={tx}
                user={user}
                onDelete={deleteTransaction}
                onSettle={(id) => markSettled([id])}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Payments section */}
      {settlements.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2">Payments</h2>
          <div className="rounded-xl bg-surface border border-border overflow-hidden divide-y divide-border">
            {settlements.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              <SettlementItem settlement={s} user={user} onDelete={handleDeleteSettlement} />
            </motion.div>
          ))}
        </div>
      </div>
      )}
    </div>
  )
}
