import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const token = searchParams.get("token")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Check if user needs group setup
        const { data: membership } = await supabase
          .from("family_members")
          .select("group_id")
          .eq("user_id", user.id)
          .single()

        if (!membership) {
          // New user — check for invite token
          if (token) {
            const { data: invite } = await supabase
              .from("invitations")
              .select("*")
              .eq("token", token)
              .is("used_by", null)
              .gt("expires_at", new Date().toISOString())
              .single()

            if (invite) {
              // Update profile role
              await supabase
                .from("profiles")
                .update({ role: invite.role, display_name: "Mum" })
                .eq("id", user.id)

              // Add to family group
              await supabase.from("family_members").insert({
                group_id: invite.group_id,
                user_id: user.id,
              })

              // Mark invite as used
              await supabase
                .from("invitations")
                .update({ used_by: user.id })
                .eq("id", invite.id)

              return NextResponse.redirect(new URL("/", origin))
            }
          }

          // No invite — send to setup
          return NextResponse.redirect(new URL("/setup", origin))
        }
      }

      return NextResponse.redirect(new URL(next, origin))
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", origin))
}
