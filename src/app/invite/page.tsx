"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Copy, Check, Share2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function InvitePage() {
  const [inviteLink, setInviteLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    generateInvite()
  }, [])

  const generateInvite = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: membership } = await supabase
      .from("family_members")
      .select("group_id")
      .eq("user_id", user.id)
      .single()

    if (!membership) { setError("No group found — please complete setup"); setLoading(false); return }

    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const { error: insertError } = await supabase.from("invitations").insert({
      token,
      group_id: membership.group_id,
      role: "mum",
      created_by: user.id,
      expires_at: expiresAt,
    })

    if (insertError) { setError(insertError.message); setLoading(false); return }

    setInviteLink(`${window.location.origin}/join?token=${token}`)
    setLoading(false)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Join Tab Tracker",
        text: "Hey Mum, use this link to join our shared Tab Tracker app!",
        url: inviteLink,
      })
    } else {
      copyLink()
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <Share2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Invite Mum</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Send her this link so she can join your shared tab
          </p>
        </div>

        {loading ? (
          <div className="h-16 animate-pulse rounded-xl bg-elevated" />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl bg-elevated border border-border p-3">
              <p className="text-xs text-muted-foreground break-all">{inviteLink}</p>
            </div>

            <Button onClick={shareLink} className="h-12 gap-2">
              <Share2 className="h-4 w-4" />
              Share link via WhatsApp / SMS
            </Button>

            <Button variant="outline" onClick={copyLink} className="h-11 gap-2 border-border">
              {copied ? <Check className="h-4 w-4 text-positive" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy link"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Link expires in 7 days
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-primary">
            Skip for now <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
