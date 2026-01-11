import { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import { env } from '../lib/env'

async function authMdw(c: Context, next: Next) {
  const token = getCookie(c, 'auth')
  if (!token) return c.json({ ok: false, reason: 'unauthorized' }, 401)

  try {
    const payload = await verify(token, env.JWT_KEY)
    c.set('userId', payload.sub)
    await next()
  } catch {
    return c.json({ ok: false, reason: 'unauthorized' }, 401)
  }
}

export { authMdw }
