"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Settlement } from "@/types/database"

const settlementCache = new Map<string, Settlement[]>()

export function useSettlements(groupId: string | null) {
  const [settlements, setSettlements] = useState<Settlement[]>(
    () => (groupId ? settlementCache.get(groupId) ?? [] : [])
  )
  const [loading, setLoading] = useState(() => (groupId ? !settlementCache.has(groupId) : false))

  useEffect(() => {
    if (!groupId) {
      setSettlements([])
      setLoading(false)
      return
    }

    const cachedSettlements = settlementCache.get(groupId)
    if (cachedSettlements) {
      setSettlements(cachedSettlements)
      setLoading(false)
    } else {
      setLoading(true)
    }

    const supabase = createClient()
    supabase
      .from("settlements")
      .select("*")
      .eq("group_id", groupId)
      .order("settled_at", { ascending: false })
      .then(({ data }) => {
        const nextSettlements = data ?? []
        settlementCache.set(groupId, nextSettlements)
        setSettlements(nextSettlements)
        setLoading(false)
      })
  }, [groupId])

  const addSettlement = useCallback(
    async (params: {
      groupId: string
      payerId: string
      payeeId: string
      amount: number
      settlementDate: string
      notes?: string
      createdBy: string
    }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("settlements")
        .insert({
          group_id: params.groupId,
          payer_id: params.payerId,
          payee_id: params.payeeId,
          amount: params.amount,
          settled_at: new Date(params.settlementDate + "T12:00:00").toISOString(),
          notes: params.notes ?? null,
          created_by: params.createdBy,
        })
        .select()
        .single()

      if (error) return { error: error.message }
      setSettlements((prev) => {
        const nextSettlements = [data, ...prev]
        settlementCache.set(params.groupId, nextSettlements)
        return nextSettlements
      })
      return { data }
    },
    []
  )

  const deleteSettlement = useCallback(async (id: string) => {
    const previous = settlements
    const nextSettlements = previous.filter((s) => s.id !== id)
    setSettlements(nextSettlements)
    if (groupId) settlementCache.set(groupId, nextSettlements)
    const supabase = createClient()
    const { error } = await supabase.from("settlements").delete().eq("id", id)
    if (error) {
      if (groupId) settlementCache.set(groupId, previous)
      setSettlements(previous)
      return { error: error.message }
    }
    return {}
  }, [groupId, settlements])

  return { settlements, loading, addSettlement, deleteSettlement }
}
