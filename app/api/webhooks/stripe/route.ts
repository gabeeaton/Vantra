import { createClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLAN_FROM_PRICE: Record<string, string> = {}

function getPlanFromPrice(priceId: string): string {
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro'
  if (priceId === process.env.STRIPE_PRICE_TEAM) return 'team'
  return 'free'
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = admin()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orgId = session.metadata?.org_id
      const plan = session.metadata?.plan
      if (orgId && plan) {
        await db.from('organizations').update({ plan }).eq('id', orgId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const orgId = sub.metadata?.org_id
      if (orgId && sub.items.data[0]) {
        const plan = getPlanFromPrice(sub.items.data[0].price.id)
        const active = sub.status === 'active' || sub.status === 'trialing'
        await db.from('organizations')
          .update({ plan: active ? plan : 'free' })
          .eq('id', orgId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const orgId = sub.metadata?.org_id
      if (orgId) {
        await db.from('organizations').update({ plan: 'free' }).eq('id', orgId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
