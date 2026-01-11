import { sign } from 'hono/jwt'
import { env } from './env'

async function jwtSign(userId: string) {
  return await sign(
    {
      sub: userId,
      exp: Math.floor(Date.now() / 1000) + 60 * 300,
    },
    env.JWT_KEY
  )
}

export { jwtSign }
