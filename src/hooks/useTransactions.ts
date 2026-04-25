"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Transaction } from "@/types/database"
import type { TransactionFormValues } from "@/lib/validations"

export type TransactionFilter = "unsettled" | "all"

const transactionCache = new Map<string, Transaction[]>()

export function useTransactions(groupId: string | null, userId: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>(
    () => (groupId ? transactionCache.get(groupId) ?? [] : [])
  )
  const [loading, setLoading] = useState(() => (groupId ? !transactionCache.has(groupId) : false))

  const fetchTransactions = useCallback(async () => {
    if (!groupId) { setLoading(false); return }
    const supabase = createClient()
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("group_id", groupId)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
    const nextTransactions = data ?? []
    transactionCache.set(groupId, nextTransactions)
    setTransactions(nextTransactions)
    setLoading(false)
  }, [groupId])

  useEffect(() => {
    if (!groupId) {
      setTransactions([])
      setLoading(false)
      return
    }

    const cachedTransactions = transactionCache.get(groupId)
    if (cachedTransactions) {
      setTransactions(cachedTransactions)
      setLoading(false)
    } else {
      setLoading(true)
    }

    fetchTransactions()
  }, [fetchTransactions, groupId])

  const addTransaction = useCallback(
    async (values: TransactionFormValues, payerId: string) => {
      if (!groupId || !userId) return { error: "Not authenticated" }
      const supabase = createClient()

      const optimisticTx: Transaction = {
        id: `temp-${Date.now()}`,
        group_id: groupId,
        payer_id: payerId,
        description: values.description,
        amount: parseFloat(values.amount),
        category: values.category,
        transaction_date: values.transaction_date,
        notes: values.notes ?? null,
        is_settled: false,
        settlement_id: null,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setTransactions((prev) => [optimisticTx, ...prev])
      transactionCache.set(groupId, [optimisticTx, ...transactions])

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          group_id: groupId,
          payer_id: payerId,
          description: values.description,
          amount: parseFloat(values.amount),
          category: values.category,
          transaction_date: values.transaction_date,
          notes: values.notes ?? null,
          created_by: userId,
        })
        .select()
        .single()

      if (error) {
        const revertedTransactions = transactions
        transactionCache.set(groupId, revertedTransactions)
        setTransactions((prev) => prev.filter((t) => t.id !== optimisticTx.id))
        return { error: error.message }
      }

      setTransactions((prev) => {
        const nextTransactions = prev.map((t) => (t.id === optimisticTx.id ? data : t))
        transactionCache.set(groupId, nextTransactions)
        return nextTransactions
      })
      return { data }
    },
    [groupId, transactions, userId]
  )

  const deleteTransaction = useCallback(
    async (id: string) => {
      const previous = transactions
      const nextTransactions = previous.filter((t) => t.id !== id)
      setTransactions(nextTransactions)
      if (groupId) transactionCache.set(groupId, nextTransactions)
      const supabase = createClient()
      const { error } = await supabase.from("transactions").delete().eq("id", id)
      if (error) {
        if (groupId) transactionCache.set(groupId, previous)
        setTransactions(previous)
        return { error: error.message }
      }
      return {}
    },
    [groupId, transactions]
  )

  const markSettled = useCallback(
    async (ids: string[], settlementId?: string) => {
      setTransactions((prev) => {
        const nextTransactions = prev.map((t) =>
          ids.includes(t.id)
            ? { ...t, is_settled: true, settlement_id: settlementId ?? null }
            : t
        )
        if (groupId) transactionCache.set(groupId, nextTransactions)
        return nextTransactions
      })
      const supabase = createClient()
      const { error } = await supabase
        .from("transactions")
        .update({ is_settled: true, settlement_id: settlementId ?? null })
        .in("id", ids)
      if (error) {
        fetchTransactions()
        return { error: error.message }
      }
      return {}
    },
    [fetchTransactions, groupId]
  )

  return { transactions, loading, addTransaction, deleteTransaction, markSettled, refetch: fetchTransactions }
}
