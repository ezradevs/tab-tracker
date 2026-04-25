"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, CheckCheck, MoreHorizontal } from "lucide-react"
import { getCategoryMeta } from "@/lib/constants"
import { formatDate, formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { Transaction, AppUser } from "@/types/database"

interface TransactionItemProps {
  transaction: Transaction
  user: AppUser
  onDelete?: (id: string) => void
  onSettle?: (id: string) => void
}

export function TransactionItem({ transaction, user, onDelete, onSettle }: TransactionItemProps) {
  const [showActions, setShowActions] = useState(false)
  const meta = getCategoryMeta(transaction.category)
  const Icon = meta.icon

  const ownerProfile = user.profile.role === "owner" ? user.profile : user.partnerProfile
  const isOwnerPaid = transaction.payer_id === ownerProfile?.id
  const viewerPaid = user.profile.role === "owner" ? isOwnerPaid : !isOwnerPaid
  const otherName = user.partnerProfile?.display_name ?? (user.profile.role === "owner" ? "Mum" : "Ezra")
  const payerLabel = viewerPaid ? "You paid" : `${otherName} paid`

  const hasActions = onDelete || (!transaction.is_settled && onSettle)

  return (
    <div className="relative overflow-hidden">
      {/* Action overlay */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-end gap-2 bg-background/95 backdrop-blur-sm px-4"
          >
            {!transaction.is_settled && onSettle && (
              <button
                onClick={() => { onSettle(transaction.id); setShowActions(false) }}
                className="flex items-center gap-1.5 rounded-lg bg-positive/15 px-3 py-2 text-xs font-medium text-positive"
              >
                <CheckCheck className="h-4 w-4" />
                Settle
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => { onDelete(transaction.id); setShowActions(false) }}
                className="flex items-center gap-1.5 rounded-lg bg-destructive/15 px-3 py-2 text-xs font-medium text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}
            <button
              onClick={() => setShowActions(false)}
              className="text-xs text-muted-foreground px-2 py-2"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center">
        <Link href={`/transactions/${transaction.id}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-3 pl-4 pr-2 py-3.5 active:bg-elevated transition-colors">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: meta.color + "22" }}
            >
              <Icon className="h-4 w-4" style={{ color: meta.color }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className={cn(
                "truncate text-sm font-medium leading-tight",
                transaction.is_settled ? "text-muted-foreground line-through" : "text-foreground"
              )}>
                {transaction.description}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {formatDate(transaction.transaction_date)}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{payerLabel}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className={cn(
                "text-sm font-semibold tabular-nums",
                transaction.is_settled
                  ? "text-muted-foreground"
                  : viewerPaid ? "text-positive" : "text-negative"
              )}>
                {viewerPaid ? "+" : "-"}{formatCurrency(transaction.amount)}
              </span>
              {transaction.is_settled && (
                <span className="text-[10px] text-muted-foreground bg-elevated px-1.5 py-0.5 rounded-full">
                  Settled
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Visible menu button */}
        {hasActions && (
          <button
            onClick={() => setShowActions(true)}
            className="flex h-full items-center px-3 py-3.5 text-muted-foreground active:text-foreground transition-colors"
            aria-label="Options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
