"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"

function JoinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <AlertCircle className="h-10 w-10 text-negative" />
        <p className="text-sm text-muted-foreground">
          This invite link is missing or invalid. Ask for a new one.
        </p>
      </div>
    )
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()

    // Validate the invite token first
    const { data: invite, error: inviteError } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", token)
      .is("used_by", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle()

    if (inviteError || !invite) {
      setError("This invite link has expired or already been used. Ask for a new one.")
      setLoading(false)
      return
    }

    // Try sign in first, then sign up if no account exists
    let userId: string | null = null

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInData?.user) {
      userId = signInData.user.id
    } else {
      // Account doesn't exist — create it
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError || !signUpData.user) {
        setError(signUpError?.message ?? "Failed to create account")
        setLoading(false)
        return
      }
      userId = signUpData.user.id
    }

    if (!userId) {
      setError("Authentication failed. Please try again.")
      setLoading(false)
      return
    }

    // Set up profile as mum
    await supabase
      .from("profiles")
      .update({ role: "mum", display_name: "Mum" })
      .eq("id", userId)

    // Add to family group
    await supabase
      .from("family_members")
      .insert({ group_id: invite.group_id, user_id: userId })

    // Mark invite as used
    await supabase
      .from("invitations")
      .update({ used_by: userId })
      .eq("id", invite.id)

    window.location.href = "/"
  }

  return (
    <form onSubmit={handleJoin} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="mum@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-elevated border-border h-12"
          required
          autoFocus
          inputMode="email"
        />
      </div>

      <div>
        <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
          Choose a password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-elevated border-border h-12 pr-11"
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" className="h-12 text-base" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Join Tab Tracker
      </Button>
    </form>
  )
}

export default function JoinPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <span className="text-2xl font-bold text-white">T</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">You&apos;re invited!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create an account to see your shared expenses
          </p>
        </div>

        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-elevated" />}>
          <JoinForm />
        </Suspense>
      </div>
    </div>
  )
}
