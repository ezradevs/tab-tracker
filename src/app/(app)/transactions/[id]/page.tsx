"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2, CheckCheck } from "lucide-react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useTransactions } from "@/hooks/useTransactions"
import { getCategoryMeta } from "@/lib/constants"
import { formatDate, formatCurrency } from "@/lib/utils"
import { PageLoader } from "@/components/shared/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, loading: userLoading } = useCurrentUser()
  const { transactions, loading: txLoading, deleteTransaction, markSettled } = useTransactions(
    user?.groupId ?? null,
    user?.id ?? null
  )

  if (userLoading || txLoading) return <PageLoader />

  const tx = transactions.find((t) => t.id === id)
  if (!tx || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-muted-foreground">Transaction not found</p>
        <Button variant="ghost" onClick={() => router.back()}>Go back</Button>
      </div>
    )
  }

  const meta = getCategoryMeta(tx.category)
  const Icon = meta.icon
  const ownerProfile = user.profile.role === "owner" ? user.profile : user.partnerProfile
  const isOwnerPaid = tx.payer_id === ownerProfile?.id
  const viewerPaid = user.profile.role === "owner" ? isOwnerPaid : !isOwnerPaid
  const otherName = user.partnerProfile?.display_name ?? (user.profile.role === "owner" ? "Mum" : "Ezra")

  const handleDelete = async () => {
    await deleteTransaction(tx.id)
    router.push("/transactions")
  }

  const handleSettle = async () => {
    await markSettled([tx.id])
    router.back()
  }

  return (
    <div className="flex flex-col p-4 pt-6 gap-5">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Hero */}
      <div className="rounded-2xl bg-surface border border-border p-6 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: meta.color + "22" }}
        >
          <Icon className="h-7 w-7" style={{ color: meta.color }} />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-1">{tx.description}</h1>
        <p
          className={cn(
            "text-4xl font-bold tabular-nums mt-3",
            tx.is_settled ? "text-muted-foreground" : viewerPaid ? "text-positive" : "text-negative"
          )}
        >
          {viewerPaid ? "+" : "-"}{formatCurrency(tx.amount)}
        </p>
        {tx.is_settled && (
          <Badge className="mt-3 bg-elevated text-muted-foreground border-border">Settled</Badge>
        )}
      </div>

      {/* Details */}
      <div className="rounded-xl bg-surface border border-border overflow-hidden divide-y divide-border">
        {[
          { label: "Date", value: formatDate(tx.transaction_date) },
          { label: "Category", value: meta.label },
          {
            label: "Paid by",
            value: viewerPaid ? `${user.profile.display_name} (you)` : otherName,
          },
          ...(tx.notes ? [{ label: "Notes", value: tx.notes }] : []),
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm text-muted-foreground">{row.label}</span>
            <span className="text-sm font-medium text-foreground">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {!tx.is_settled && (
          <Button onClick={handleSettle} variant="outline" className="h-11 gap-2 border-positive/50 text-positive">
            <CheckCheck className="h-4 w-4" />
            Mark as settled
          </Button>
        )}
        <Button
          onClick={handleDelete}
          variant="outline"
          className="h-11 gap-2 border-destructive/50 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete transaction
        </Button>
      </div>
    </div>
  )
}
