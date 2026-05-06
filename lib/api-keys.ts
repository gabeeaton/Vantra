import crypto from 'crypto'

export function generateApiKey(): { raw: string; hash: string } {
  const raw = `van_live_${crypto.randomBytes(24).toString('hex')}`
  const hash = crypto.createHash('sha256').update(raw).digest('hex')
  return { raw, hash }
}

export function hashApiKey(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}
