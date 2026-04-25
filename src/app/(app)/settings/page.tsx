"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, User, Share2, ChevronRight, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageLoader } from "@/components/shared/LoadingSpinner"

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading } = useCurrentUser()
  const [displayName, setDisplayName] = useState("")
  const [editingName, setEditingName] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  if (loading) return <PageLoader />
  if (!user) return null

  const handleSaveName = async () => {
    if (!displayName.trim()) return
    setSavingName(true)
    const supabase = createClient()
    await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("id", user.id)
    setSavingName(false)
    setEditingName(false)
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const handleGenerateInvite = () => {
    router.push("/invite")
  }

  const mumName = user.partnerProfile?.display_name ?? null

  return (
    <div className="flex flex-col gap-6 p-4 pt-6">
      <h1 className="text-xl font-bold text-foreground">Settings</h1>

      {/* Account */}
      <section>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground px-1">
          Account
        </p>
        <div className="rounded-xl bg-surface border border-border overflow-hidden divide-y divide-border">
          {/* Display name */}
          <div className="px-4 py-3.5">
            {editingName ? (
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Your name</Label>
                <div className="flex gap-2">
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-elevated border-border h-10 flex-1"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  />
                  <Button size="sm" onClick={handleSaveName} disabled={savingName} className="h-10">
                    {nameSaved ? <Check className="h-4 w-4" /> : "Save"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingName(false)} className="h-10">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setDisplayName(user.profile.display_name); setEditingName(true) }}
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{user.profile.display_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Family */}
      <section>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground px-1">
          Family
        </p>
        <div className="rounded-xl bg-surface border border-border overflow-hidden divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-elevated">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {mumName ?? "Mum (not joined yet)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mumName ? "Active member" : "Invite pending"}
                </p>
              </div>
            </div>
            {!mumName && (
              <span className="text-xs text-negative font-medium">Not joined</span>
            )}
          </div>

          {user.profile.role === "owner" && (
            <button
              onClick={handleGenerateInvite}
              className="flex w-full items-center justify-between px-4 py-3.5 active:bg-elevated transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                  <Share2 className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {mumName ? "Resend invite link" : "Invite Mum"}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </section>

      {/* Sign out */}
      <section>
        <div className="rounded-xl bg-surface border border-border overflow-hidden">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-3 px-4 py-3.5 active:bg-elevated transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10">
              <LogOut className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-sm font-medium text-destructive">
              {signingOut ? "Signing out…" : "Sign out"}
            </p>
          </button>
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground">Tab Tracker · AUD</p>
    </div>
  )
}
