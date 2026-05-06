import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const db = admin()

  const { data: invite } = await db
    .from('invites')
    .select('*, organizations(name), inviter:users!invited_by(email)')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!invite) return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 })

  return NextResponse.json({
    orgName: (invite.organizations as { name: string } | null)?.name ?? 'Unknown',
    invitedBy: (invite.inviter as { email: string } | null)?.email ?? 'A teammate',
    email: invite.email,
  })
}
