"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, TrendingDown, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface BalanceCardProps {
  net: number
  unsettledCount: number
  viewerRole: "owner" | "mum"
  otherName: string
}

function useCountUp(target: number, duration = 800) {
  const [current, setCurrent] = useState(target)
  const prevRef = useRef(target)

  useEffect(() => {
    const start = prevRef.current
    const diff = target - start
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(start + diff * eased)
      if (progress < 1) requestAnimationFrame(tick)
      else prevRef.current = target
    }

    requestAnimationFrame(tick)
  }, [target, duration])

  return current
}

export function BalanceCard({ net, unsettledCount, viewerRole, otherName }: BalanceCardProps) {
  const animated = useCountUp(Math.abs(net))
  const isSettled = Math.abs(net) < 0.01

  // From owner's view: positive net = good (mum owes them)
  // From mum's view:   positive net = bad  (they owe owner)
  const viewerIsOwed = viewerRole === "owner" ? net > 0 : net < 0

  const label = (() => {
    if (viewerRole === "owner") {
      return net > 0 ? `${otherName} owes you` : `You owe ${otherName}`
    } else {
      return net > 0 ? `You owe ${otherName}` : `${otherName} owes you`
    }
  })()

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface border border-border p-6">
      <div
        className={cn(
          "pointer-events-none absolute -top-12 left-1/2 h-32 w-48 -translate-x-1/2 rounded-full blur-3xl opacity-20 transition-colors duration-700",
          isSettled ? "bg-primary" : viewerIsOwed ? "bg-positive" : "bg-negative"
        )}
      />

      <div className="relative text-center">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Current Balance
        </p>

        {isSettled ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="my-4 flex flex-col items-center gap-2"
          >
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <p className="text-2xl font-bold text-foreground">All settled up</p>
          </motion.div>
        ) : (
          <div className="my-3">
            <div className="flex items-center justify-center gap-1">
              {viewerIsOwed
                ? <TrendingUp className="h-5 w-5 text-positive" />
                : <TrendingDown className="h-5 w-5 text-negative" />
              }
              <span className={cn(
                "text-5xl font-bold tracking-tight tabular-nums",
                viewerIsOwed ? "text-positive" : "text-negative"
              )}>
                {formatCurrency(animated)}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{label}</p>
          </div>
        )}

        {unsettledCount > 0 && (
          <p className="mb-4 text-xs text-muted-foreground">
            {unsettledCount} unsettled {unsettledCount === 1 ? "item" : "items"}
          </p>
        )}

        {!isSettled && (
          <Link href="/settle">
            <Button className="w-full" size="sm">Settle Up</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
