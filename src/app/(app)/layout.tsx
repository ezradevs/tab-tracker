"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { BottomNav } from "@/components/layout/BottomNav"
import { AppShell } from "@/components/layout/AppShell"
import { InstallPrompt } from "@/components/shared/InstallPrompt"
import { PageLoader } from "@/components/shared/LoadingSpinner"
import { useCurrentUser } from "@/hooks/useCurrentUser"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { state, user } = useCurrentUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (state.status === "unauthenticated") router.push("/login")
    if (state.status === "no-profile" || state.status === "no-group") router.push("/setup")
  }, [state.status, router])

  if (state.status === "loading" || state.status === "unauthenticated") return <PageLoader />
  if (state.status === "no-profile" || state.status === "no-group") return <PageLoader />
  if (!user) return <PageLoader />

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
          transition={{
            opacity: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
            filter: { duration: 0.24, ease: "easeOut" },
          }}
          className="flex-1 pb-24"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <BottomNav />
      <InstallPrompt />
    </AppShell>
  )
}
