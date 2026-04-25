"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { transactionSchema, type TransactionFormValues } from "@/lib/validations"
import { CATEGORIES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PayerToggle } from "@/components/forms/PayerToggle"
import type { AppUser } from "@/types/database"
import { useTransactions } from "@/hooks/useTransactions"

interface AddTransactionFormProps {
  user: AppUser
}

export function AddTransactionForm({ user }: AddTransactionFormProps) {
  const router = useRouter()
  const [paidBy, setPaidBy] = useState<"owner" | "mum">("owner")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const { addTransaction } = useTransactions(user.groupId, user.id)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      paid_by: "owner",
      category: "groceries",
      transaction_date: format(new Date(), "yyyy-MM-dd"),
    },
  })

  const onSubmit = async (values: TransactionFormValues) => {
    setSubmitting(true)
    setError("")

    const payerId =
      paidBy === "owner"
        ? user.profile.role === "owner"
          ? user.id
          : user.partnerProfile?.id ?? user.id
        : user.profile.role === "mum"
          ? user.id
          : user.partnerProfile?.id ?? user.id

    const result = await addTransaction({ ...values, paid_by: paidBy }, payerId)
    if ("error" in result && result.error) {
      setError(result.error)
      setSubmitting(false)
      return
    }

    router.push("/")
  }

  const mumName = user.profile.role === "mum"
    ? user.profile.display_name
    : user.partnerProfile?.display_name ?? "Mum"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-4">
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
            placeholder="0.00"
            className="pl-8 text-2xl font-bold h-14 bg-elevated border-border"
            {...register("amount")}
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Description
        </Label>
        <Input
          id="description"
          placeholder="e.g. Woolworths shop"
          className="bg-elevated border-border"
          {...register("description")}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Who paid */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Who paid?
        </Label>
        <PayerToggle value={paidBy} onChange={setPaidBy} mumLabel={mumName} />
      </div>

      {/* Category */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Category
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <label
                key={cat.value}
                className="relative cursor-pointer"
              >
                <input
                  type="radio"
                  value={cat.value}
                  className="sr-only peer"
                  {...register("category")}
                />
                <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-elevated p-3 text-center transition-all peer-checked:border-primary peer-checked:bg-accent">
                  <Icon className="h-5 w-5" style={{ color: cat.color }} />
                  <span className="text-xs font-medium text-foreground">{cat.label}</span>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      {/* Date */}
      <div>
        <Label htmlFor="date" className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Date
        </Label>
        <Input
          id="date"
          type="date"
          className="bg-elevated border-border"
          {...register("transaction_date")}
        />
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes" className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Notes <span className="normal-case text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="notes"
          placeholder="Any extra details..."
          className="bg-elevated border-border"
          {...register("notes")}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="h-12 text-base" disabled={submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Add Transaction
      </Button>
    </form>
  )
}
