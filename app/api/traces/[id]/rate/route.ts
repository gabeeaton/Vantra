import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('org_id').eq('id', user.id).single()
  if (!userData?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 })

  const { id } = await params
  const body = await req.json()
  const { rating } = body

  if (rating !== 'up' && rating !== 'down' && rating !== null) {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
  }

  const { data: trace } = await supabase
    .from('traces')
    .select('metadata')
    .eq('id', id)
    .eq('org_id', userData.org_id)
    .single()

  if (!trace) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const newMetadata = { ...(trace.metadata ?? {}) }
  if (rating === null) {
    delete newMetadata.rating
  } else {
    newMetadata.rating = rating
  }

  const { error } = await supabase
    .from('traces')
    .update({ metadata: newMetadata })
    .eq('id', id)
    .eq('org_id', userData.org_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
