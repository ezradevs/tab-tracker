import { cn } from "@/lib/utils"

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div className="absolute h-16 w-16 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-surface/90 shadow-lg shadow-black/30">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/15 border-t-primary" />
        <div className="absolute h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_18px_rgba(124,58,237,0.8)]" />
      </div>
    </div>
  )
}

interface PageLoaderProps {
  className?: string
  label?: string
}

export function PageLoader({
  className,
  label = "Loading your tab…",
}: PageLoaderProps = {}) {
  return (
    <div
      className={cn(
        "flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center",
        className
      )}
    >
      <LoadingSpinner />
      <div className="space-y-1">
        <p className="text-sm font-semibold tracking-wide text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">Syncing balances and recent activity</p>
      </div>
    </div>
  )
}
