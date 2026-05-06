import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const RETENTION_DAYS: Record<string, number> = {
  free: 30,
  pro: 90,
  team: 365,
  enterprise: Infinity,
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: orgs } = await db
    .from('organizations')
    .select('id, plan')

  if (!orgs?.length) return NextResponse.json({ purged: 0 })

  let totalPurged = 0

  for (const org of orgs) {
    const days = RETENTION_DAYS[org.plan ?? 'free'] ?? RETENTION_DAYS.free
    if (days === Infinity) continue

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    const { count } = await db
      .from('spans')
      .delete({ count: 'exact' })
      .eq('org_id', org.id)
      .lt('created_at', cutoff.toISOString())

    totalPurged += count ?? 0
  }

  return NextResponse.json({ purged: totalPurged })
}
