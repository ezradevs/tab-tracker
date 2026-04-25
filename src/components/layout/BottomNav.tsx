"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, List, Plus, Clock, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/transactions", icon: List, label: "Transactions" },
  { href: "/add", icon: Plus, label: "Add", fab: true },
  { href: "/history", icon: Clock, label: "History" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    tabs.forEach((tab) => router.prefetch(tab.href))
  }, [router])

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-md bg-surface/95 backdrop-blur-md border-t border-border safe-bottom">
        <div className="flex items-end justify-around px-1 pt-2 pb-2">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)

            if (tab.fab) {
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => {
                    if (pathname !== tab.href) {
                      window.dispatchEvent(new CustomEvent("tab:navigation-start"))
                    }
                  }}
                  className="relative -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 transition-transform active:scale-95"
                  aria-label="Add transaction"
                >
                  <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
                </Link>
              )
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => {
                  if (!(tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href))) {
                    window.dispatchEvent(new CustomEvent("tab:navigation-start"))
                  }
                }}
                className="flex flex-col items-center gap-1 px-2 py-1 min-w-[48px]"
              >
                <tab.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
