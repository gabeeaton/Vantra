import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

async function getContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('users').select('org_id, role').eq('id', user.id).single()
  if (!data?.org_id) return null
  return { supabase, user, orgId: data.org_id, role: data.role }
}

export async function GET() {
  const ctx = await getContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: members }, { data: invites }] = await Promise.all([
    ctx.supabase.from('users').select('id, email, role, created_at').eq('org_id', ctx.orgId),
    ctx.supabase.from('invites').select('id, email, created_at, expires_at, accepted_at').eq('org_id', ctx.orgId).is('accepted_at', null).gt('expires_at', new Date().toISOString()),
  ])

  return NextResponse.json({ members: members ?? [], invites: invites ?? [] })
}

export async function POST(req: NextRequest) {
  const ctx = await getContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (ctx.role !== 'owner' && ctx.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email } = await req.json()
  if (!email || typeof email !== 'string' || email.length > 254) return NextResponse.json({ error: 'Invalid email' }, { status: 400 })

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get org name
  const { data: org } = await admin.from('organizations').select('name').eq('id', ctx.orgId).single()

  // Create invite
  const { data: invite, error } = await admin.from('invites').insert({
    org_id: ctx.orgId,
    email: email.toLowerCase().trim(),
    invited_by: ctx.user.id,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send email
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key') {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`

    await resend.emails.send({
      from: 'Vantra <hello@vantra.dev>',
      to: email,
      subject: `You've been invited to join ${org?.name ?? 'a team'} on Vantra`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background: #000; color: #fff; padding: 32px; border-radius: 12px;">
          <div style="margin-bottom: 24px;">
            <span style="font-weight: 900; font-size: 18px;">Vantra</span>
          </div>
          <h2 style="color: #fff; margin: 0 0 8px;">You've been invited</h2>
          <p style="color: #71717a; margin: 0 0 24px;">
            ${ctx.user.email} invited you to join <strong style="color: #fff">${org?.name ?? 'their team'}</strong> on Vantra.
          </p>
          <a href="${inviteUrl}" style="display: inline-block; background: #4DE5FC; color: #000; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">
            Accept invitation →
          </a>
          <p style="color: #3f3f46; font-size: 12px; margin-top: 24px;">
            This invite expires in 7 days. If you didn't expect this, you can ignore it.
          </p>
        </div>
      `,
    })
  }

  return NextResponse.json({ invite })
}

export async function DELETE(req: NextRequest) {
  const ctx = await getContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (ctx.role !== 'owner' && ctx.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await req.json()
  const { error } = await ctx.supabase.from('invites').delete().eq('id', id).eq('org_id', ctx.orgId)
  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
