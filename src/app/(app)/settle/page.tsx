"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useTransactions } from "@/hooks/useTransactions"
import { useSettlements } from "@/hooks/useSettlements"
import { useBalance } from "@/hooks/useBalance"
import { SettleUpForm } from "@/components/forms/SettleUpForm"
import { PageLoader } from "@/components/shared/LoadingSpinner"

export default function SettlePage() {
  const router = useRouter()
  const { user, loading: userLoading } = useCurrentUser()
  const { transactions, loading: txLoading, markSettled } = useTransactions(
    user?.groupId ?? null,
    user?.id ?? null
  )
  const { settlements, loading: settlLoading } = useSettlements(user?.groupId ?? null)
  const balance = useBalance(transactions, settlements, user)

  if (userLoading || txLoading || settlLoading) return <PageLoader />
  if (!user) return null

  return (
    <div className="flex flex-col pt-6">
      <div className="flex items-center gap-3 px-4 mb-2">
        <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center rounded-full bg-elevated">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Settle Up</h1>
      </div>
      <SettleUpForm
        user={user}
        net={balance.net}
        unsettledTransactions={transactions.filter(t => !t.is_settled)}
        onSettled={(ids, settlementId) => markSettled(ids, settlementId)}
      />
    </div>
  )
}
