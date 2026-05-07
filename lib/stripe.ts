import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-04-22.dahlia',
    })
  }
  return _stripe
}

export const PLANS: Record<string, { priceId: string; name: string; limit: number }> = {
  indie: {
    priceId: process.env.STRIPE_PRICE_INDIE!,
    name: 'Indie',
    limit: 500_000,
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO!,
    name: 'Pro',
    limit: 2_000_000,
  },
  team: {
    priceId: process.env.STRIPE_PRICE_TEAM!,
    name: 'Team',
    limit: 10_000_000,
  },
}
