"use client"

import { useMemo } from "react"
import type { Transaction, Settlement, AppUser } from "@/types/database"

export function useBalance(
  transactions: Transaction[],
  settlements: Settlement[],
  user: AppUser | null
) {
  return useMemo(() => {
    if (!user) return { net: 0, ownerPaidTotal: 0, mumPaidTotal: 0, unsettledCount: 0 }

    const ownerProfile = user.profile.role === "owner" ? user.profile : user.partnerProfile
    const mumProfile   = user.profile.role === "mum"   ? user.profile : user.partnerProfile
    const ownerId = ownerProfile?.id
    const mumId   = mumProfile?.id

    // Total amounts paid via transactions (all time, regardless of is_settled flag)
    const ownerPaidTotal = transactions
      .filter(t => t.payer_id === ownerId)
      .reduce((sum, t) => sum + t.amount, 0)

    const mumPaidTotal = transactions
      .filter(t => t.payer_id === mumId)
      .reduce((sum, t) => sum + t.amount, 0)

    // Settlements directly reduce the outstanding balance
    const mumSettled   = settlements.filter(s => s.payer_id === mumId).reduce((sum, s) => sum + s.amount, 0)
    const ownerSettled = settlements.filter(s => s.payer_id === ownerId).reduce((sum, s) => sum + s.amount, 0)

    // net > 0 = mum owes owner; net < 0 = owner owes mum
    const net = ownerPaidTotal - mumPaidTotal - mumSettled + ownerSettled

    // Unsettled count is just for display (transactions not individually ticked off)
    const unsettledCount = transactions.filter(t => !t.is_settled).length

    return { net, ownerPaidTotal, mumPaidTotal, unsettledCount }
  }, [transactions, settlements, user])
}
