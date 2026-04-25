"use client"

import { motion } from "framer-motion"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useTransactions } from "@/hooks/useTransactions"
import { useSettlements } from "@/hooks/useSettlements"
import { useBalance } from "@/hooks/useBalance"
import { BalanceCard } from "@/components/dashboard/BalanceCard"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { PageLoader } from "@/components/shared/LoadingSpinner"

export default function DashboardPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const { transactions, loading: txLoading } = useTransactions(user?.groupId ?? null, user?.id ?? null)
  const { settlements, loading: settlLoading } = useSettlements(user?.groupId ?? null)
  const balance = useBalance(transactions, settlements, user)

  if (userLoading || txLoading || settlLoading) return <PageLoader />
  if (!user) return null

  const viewerRole = user.profile.role
  const otherName  = user.partnerProfile?.display_name ?? (viewerRole === "owner" ? "Mum" : "Ezra")

  const myPaidTotal    = viewerRole === "owner" ? balance.ownerPaidTotal : balance.mumPaidTotal
  const theyPaidTotal  = viewerRole === "owner" ? balance.mumPaidTotal   : balance.ownerPaidTotal

  return (
    <div className="flex flex-col gap-5 p-4 pt-6">
      <div>
        <p className="text-xs text-muted-foreground">Welcome back</p>
        <h1 className="text-xl font-bold text-foreground">{user.profile.display_name}</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <BalanceCard
          net={balance.net}
          unsettledCount={balance.unsettledCount}
          viewerRole={viewerRole}
          otherName={otherName}
        />
      </motion.div>

      {(myPaidTotal > 0 || theyPaidTotal > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="rounded-xl bg-surface border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">You&apos;ve paid</p>
            <p className="text-lg font-bold text-positive">${myPaidTotal.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-surface border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">{otherName} paid</p>
            <p className="text-lg font-bold text-negative">${theyPaidTotal.toFixed(2)}</p>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      >
        <RecentActivity transactions={transactions} settlements={settlements} user={user} />
      </motion.div>
    </div>
  )
}
