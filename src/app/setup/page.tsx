"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function SetupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    // Update display name
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ display_name: name.trim() || "Me", role: "owner" })
      .eq("id", user.id)

    if (profileError) { setError(profileError.message); setLoading(false); return }

    // Create family group
    const { data: group, error: groupError } = await supabase
      .from("family_groups")
      .insert({ name: "Family" })
      .select()
      .single()

    if (groupError || !group) { setError(groupError?.message ?? "Failed to create group"); setLoading(false); return }

    // Add owner to group
    const { error: memberError } = await supabase
      .from("family_members")
      .insert({ group_id: group.id, user_id: user.id })

    if (memberError) { setError(memberError.message); setLoading(false); return }

    router.push("/invite")
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <span className="text-2xl font-bold text-white">T</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set up your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Just a few quick details</p>
        </div>

        <form onSubmit={handleSetup} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
              Your name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Ezra"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-elevated border-border h-12"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="h-12 text-base" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </form>
      </div>
    </div>
  )
}
