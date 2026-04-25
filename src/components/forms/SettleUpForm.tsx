"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { settleSchema, type SettleFormValues } from "@/lib/validations"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PayerToggle } from "@/components/forms/PayerToggle"
import type { AppUser, Transaction } from "@/types/database"
import { useSettlements } from "@/hooks/useSettlements"

interface SettleUpFormProps {
  user: AppUser
  net: number
  unsettledTransactions: Transaction[]
  onSettled: (ids: string[], settlementId: string) => void
}

export function SettleUpForm({ user, net, unsettledTransactions, onSettled }: SettleUpFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const { addSettlement } = useSettlements(user.groupId)

  const viewerRole = user.profile.role
  const ownerProfile = viewerRole === "owner" ? user.profile : user.partnerProfile
  const mumProfile  = viewerRole === "mum"   ? user.profile : user.partnerProfile
  const otherName   = user.partnerProfile?.display_name ?? (viewerRole === "owner" ? "Mum" : "Ezra")

  // net > 0 = mum owes owner → mum should pay by default
  const defaultPayer: "owner" | "mum" = net > 0 ? "mum" : "owner"
  const [paidBy, setPaidBy] = useState<"owner" | "mum">(defaultPayer)

  // From viewer's perspective: are they owed money?
  const viewerIsOwed = viewerRole === "owner" ? net > 0 : net < 0

  // Balance label from viewer's perspective
  const balanceLabel = (() => {
    if (viewerRole === "owner") return net > 0 ? `${otherName} owes you` : `You owe ${otherName}`
    return net > 0 ? `You owe ${otherName}` : `${otherName} owes you`
  })()

  // PayerToggle labels — "You" always means the current viewer
  const ownerToggleLabel = viewerRole === "owner" ? "You" : otherName
  const mumToggleLabel   = viewerRole === "mum"   ? "You" : otherName

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettleFormValues>({
    resolver: zodResolver(settleSchema),
    defaultValues: {
      amount: Math.abs(net).toFixed(2),
      paid_by: defaultPayer,
      settlement_date: format(new Date(), "yyyy-MM-dd"),
    },
  })

  const onSubmit = async (values: SettleFormValues) => {
    setSubmitting(true)
    setError("")

    if (!ownerProfile || !mumProfile) {
      setError("Could not determine user profiles")
      setSubmitting(false)
      return
    }

    const payerId = paidBy === "owner" ? ownerProfile.id : mumProfile.id
    const payeeId = paidBy === "owner" ? mumProfile.id : ownerProfile.id
    const amount  = parseFloat(values.amount)

    const result = await addSettlement({
      groupId: user.groupId,
      payerId,
      payeeId,
      amount,
      settlementDate: values.settlement_date,
      notes: values.notes,
      createdBy: user.id,
    })

    if ("error" in result && result.error) {
      setError(result.error)
      setSubmitting(false)
      return
    }

    // Mark transactions as settled up to the amount paid
    let remaining = amount
    const toSettle: string[] = []
    for (const tx of unsettledTransactions) {
      if (remaining <= 0) break
      const txOwedByPayer =
        paidBy === "mum"
          ? tx.payer_id === ownerProfile.id
          : tx.payer_id === mumProfile.id
      // Only settle a transaction if this payment fully covers it
      if (txOwedByPayer && remaining >= tx.amount) {
        toSettle.push(tx.id)
        remaining -= tx.amount
      }
    }

    if (toSettle.length > 0 && result.data) {
      onSettled(toSettle, result.data.id)
    }

    router.push("/")
  }

  const affectedCount = unsettledTransactions.filter((tx) => {
    const txOwedByPayer =
      paidBy === "mum"
        ? tx.payer_id === ownerProfile?.id
        : tx.payer_id === mumProfile?.id
    return txOwedByPayer
  }).length

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-4">
      {/* Balance summary */}
      {Math.abs(net) > 0 && (
        <div className="rounded-xl bg-surface border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Outstanding balance</p>
          <p className={`text-2xl font-bold ${viewerIsOwed ? "text-positive" : "text-negative"}`}>
            {formatCurrency(Math.abs(net))}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{balanceLabel}</p>
        </div>
      )}

      {/* Who is paying */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Who is paying?
        </Label>
        <PayerToggle
          value={paidBy}
          onChange={setPaidBy}
          ownerLabel={ownerToggleLabel}
          mumLabel={mumToggleLabel}
        />
      </div>

      {/* Amount */}
      <div>
        <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Amount
        </Label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-medium text-muted-foreground">
            $
          </span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            inputMode="decimal"
            className="pl-8 text-2xl font-bold h-14 bg-elevated border-border"
            {...register("amount")}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <Label htmlFor="settlement_date" className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Date
        </Label>
        <Input
          id="settlement_date"
          type="date"
          className="bg-elevated border-border"
          {...register("settlement_date")}
        />
      </div>

      {affectedCount > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          This will mark up to {affectedCount} transaction{affectedCount !== 1 ? "s" : ""} as settled
        </p>
      )}

      {/* Notes */}
      <div>
        <Label htmlFor="notes" className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Notes <span className="normal-case text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="notes"
          placeholder="e.g. Cash payment"
          className="bg-elevated border-border"
          {...register("notes")}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="h-12 text-base" disabled={submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Record Settlement
      </Button>
    </form>
  )
}
