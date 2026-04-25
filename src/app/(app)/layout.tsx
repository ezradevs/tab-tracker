"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ViewTransition } from "react"
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
      <ViewTransition enter="page-blur-enter" exit="page-blur-exit" default="none">
        <main key={pathname} className="flex-1 pb-24">
          {children}
        </main>
      </ViewTransition>
      <BottomNav />
      <InstallPrompt />
    </AppShell>
  )
}
