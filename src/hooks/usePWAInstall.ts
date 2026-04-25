"use client"

import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
    const installed = window.matchMedia("(display-mode: standalone)").matches || standalone

    setIsIOS(ios)
    setIsInstalled(installed)

    if (ios && !installed) {
      const dismissed = localStorage.getItem("ios-install-dismissed")
      if (!dismissed) setShowIOSPrompt(true)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", () => setIsInstalled(true))

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const promptInstall = async () => {
    if (!installPrompt) return false
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === "accepted") setIsInstalled(true)
    setInstallPrompt(null)
    return outcome === "accepted"
  }

  const dismissIOSPrompt = () => {
    localStorage.setItem("ios-install-dismissed", "1")
    setShowIOSPrompt(false)
  }

  return { installPrompt, isInstalled, isIOS, showIOSPrompt, promptInstall, dismissIOSPrompt }
}
