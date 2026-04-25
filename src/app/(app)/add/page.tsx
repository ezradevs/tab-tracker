"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { AddTransactionForm } from "@/components/forms/AddTransactionForm"
import { PageLoader } from "@/components/shared/LoadingSpinner"

export default function AddPage() {
  const router = useRouter()
  const { user, loading } = useCurrentUser()

  if (loading) return <PageLoader />
  if (!user) return null

  return (
    <div className="flex flex-col pt-6">
      <div className="flex items-center gap-3 px-4 mb-2">
        <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center rounded-full bg-elevated">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Add Transaction</h1>
      </div>
      <AddTransactionForm user={user} />
    </div>
  )
}
