"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { AppUser, Profile } from "@/types/database"

export type UserState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "no-profile" }   // logged in but no DB profile yet
  | { status: "no-group" }     // has profile but hasn't done setup
  | { status: "ready"; user: AppUser }

let cachedUserState: UserState | null = null

export function useCurrentUser() {
  const [state, setState] = useState<UserState>(cachedUserState ?? { status: "loading" })

  useEffect(() => {
    const supabase = createClient()

    const updateState = (nextState: UserState) => {
      cachedUserState = nextState
      setState(nextState)
    }

    async function loadUser() {
      try {
        // getSession reads locally — no network call, works on any device/IP
        const { data: { session } } = await supabase.auth.getSession()
        const authUser = session?.user
        if (!authUser) { updateState({ status: "unauthenticated" }); return }

        const [{ data: profile }, { data: membership }] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle(),
          supabase.from("family_members").select("group_id").eq("user_id", authUser.id).maybeSingle(),
        ])

        if (!profile) { updateState({ status: "no-profile" }); return }
        if (!membership) { updateState({ status: "no-group" }); return }

        const partnerRole = profile.role === "owner" ? "mum" : "owner"
        const { data: partnerMembers } = await supabase
          .from("family_members")
          .select("user_id")
          .eq("group_id", membership.group_id)
          .neq("user_id", authUser.id)

        let partnerProfile: Profile | null = null
        if (partnerMembers && partnerMembers.length > 0) {
          const { data: pp } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", partnerMembers[0].user_id)
            .eq("role", partnerRole)
            .maybeSingle()
          partnerProfile = pp
        }

        updateState({
          status: "ready",
          user: {
            id: authUser.id,
            email: authUser.email!,
            profile,
            groupId: membership.group_id,
            partnerProfile,
          },
        })
      } catch {
        updateState({ status: "unauthenticated" })
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) loadUser()
      else updateState({ status: "unauthenticated" })
    })

    return () => subscription.unsubscribe()
  }, [])

  // Backwards-compatible helpers
  const user = state.status === "ready" ? state.user : null
  const loading = state.status === "loading"

  return { state, user, loading }
}
