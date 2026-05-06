import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const inviteToken = searchParams.get('invite')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Handle invite flow
        if (inviteToken) {
          const admin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )

          const { data: invite } = await admin
            .from('invites')
            .select('*')
            .eq('token', inviteToken)
            .is('accepted_at', null)
            .gt('expires_at', new Date().toISOString())
            .single()

          if (invite) {
            // Add user to the org
            await admin.from('users').upsert({
              id: user.id,
              email: user.email,
              org_id: invite.org_id,
              role: 'member',
            })
            // Mark invite accepted
            await admin.from('invites').update({ accepted_at: new Date().toISOString() }).eq('id', invite.id)
            return NextResponse.redirect(`${origin}/dashboard`)
          }
        }

        const { data: userData } = await supabase
          .from('users')
          .select('org_id')
          .eq('id', user.id)
          .single()

        if (!userData?.org_id) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
