"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { BottomNav } from "@/components/layout/BottomNav"
import { AppShell } from "@/components/layout/AppShell"
import { InstallPrompt } from "@/components/shared/InstallPrompt"
import { PageLoader } from "@/components/shared/LoadingSpinner"
import { useCurrentUser } from "@/hooks/useCurrentUser"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { state, user } = useCurrentUser()
  const router = useRouter()
  const pathname = usePathname()
  const lastPathnameRef = useRef(pathname)
  const transitionTimeoutRef = useRef<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (state.status === "unauthenticated") router.push("/login")
    if (state.status === "no-profile" || state.status === "no-group") router.push("/setup")
  }, [state.status, router])

  useEffect(() => {
    const handleNavigationStart = () => {
      if (transitionTimeoutRef.current) window.clearTimeout(transitionTimeoutRef.current)
      setIsTransitioning(true)
    }

    window.addEventListener("tab:navigation-start", handleNavigationStart)
    return () => window.removeEventListener("tab:navigation-start", handleNavigationStart)
  }, [])

  useEffect(() => {
    if (lastPathnameRef.current === pathname) return

    lastPathnameRef.current = pathname

    if (transitionTimeoutRef.current) window.clearTimeout(transitionTimeoutRef.current)
    transitionTimeoutRef.current = window.setTimeout(() => {
      setIsTransitioning(false)
      transitionTimeoutRef.current = null
    }, 340)
  }, [pathname])

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) window.clearTimeout(transitionTimeoutRef.current)
    }
  }, [])

  if (state.status === "loading" || state.status === "unauthenticated") return <PageLoader />
  if (state.status === "no-profile" || state.status === "no-group") return <PageLoader />
  if (!user) return <PageLoader />

  return (
    <AppShell>
      <div className="relative flex-1 pb-24 overflow-hidden">
        <motion.main
          key={pathname}
          initial={{ opacity: 0.92, y: 14, scale: 0.992, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="h-full"
        >
          {children}
        </motion.main>

        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              key="route-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: {
                  duration: 0.28,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              className="pointer-events-none absolute inset-0 z-20 bg-background/18 backdrop-blur-[10px]"
            >
              <motion.div
                initial={{ opacity: 0.35, scale: 0.96 }}
                animate={{ opacity: 0.55, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(124,58,237,0.18),transparent_58%)]"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
      <InstallPrompt />
    </AppShell>
  )
}
