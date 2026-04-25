"use client"

import { Share, X } from "lucide-react"
import { usePWAInstall } from "@/hooks/usePWAInstall"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function InstallPrompt() {
  const { showIOSPrompt, dismissIOSPrompt, installPrompt, promptInstall } = usePWAInstall()

  if (installPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md">
        <div className="rounded-xl bg-elevated border border-border p-4 shadow-xl shadow-black/40">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Install Tab Tracker</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add to your home screen for quick access
              </p>
            </div>
            <button onClick={dismissIOSPrompt} className="text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={promptInstall} size="sm" className="mt-3 w-full">
            Install
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {showIOSPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md"
        >
          <div className="rounded-xl bg-elevated border border-border p-4 shadow-xl shadow-black/40">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Add to Home Screen</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Tap <Share className="inline h-3 w-3 mx-0.5" /> then{" "}
                  <strong className="text-foreground">Add to Home Screen</strong> for the full app experience
                </p>
              </div>
              <button onClick={dismissIOSPrompt} className="text-muted-foreground mt-0.5">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
