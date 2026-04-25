import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-md min-h-svh flex flex-col", className)}>
      {children}
    </div>
  )
}
