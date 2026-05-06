import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!userData?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 })

  const { id } = await params

  const [traceResult, spansResult] = await Promise.all([
    supabase
      .from('traces')
      .select('*')
      .eq('id', id)
      .eq('org_id', userData.org_id)
      .single(),
    supabase
      .from('spans')
      .select('*')
      .eq('trace_id', id)
      .eq('org_id', userData.org_id)
      .order('start_time', { ascending: true }),
  ])

  if (!traceResult.data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ trace: traceResult.data, spans: spansResult.data ?? [] })
}
