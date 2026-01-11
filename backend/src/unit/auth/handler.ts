import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import {
  AuthenticateUserSchema,
  ChallengeUserSchema,
  IdentifyUserSchema,
} from './contract'
import { authInteractor } from './interactor'
import { deleteCookie, setCookie } from 'hono/cookie'
import { jwtSign } from '../../lib/jwtSign'
import { AuthVariables } from '../../type/authVariables'

const app = new Hono<{ Variables: AuthVariables }>()

const routes = app
  .post('/identify', zValidator('json', IdentifyUserSchema), async (c) => {
    const data = c.req.valid('json')

    const result = await authInteractor.identifyUser(data)
    return c.json(result, result.ok ? 200 : 404)
  })
  .post('/logout', async (c) => {
    deleteCookie(c, 'auth', { path: '/' })
    return c.json({ ok: true, message: 'logout successfully' })
  })
  .post('/challenge', zValidator('json', ChallengeUserSchema), async (c) => {
    const data = c.req.valid('json')

    const result = await authInteractor.challengeUser(data)
    return c.json(result, result.ok ? 201 : 409)
  })
  .post(
    '/authenticate',
    zValidator('json', AuthenticateUserSchema),
    async (c) => {
      const data = c.req.valid('json')

      const result = await authInteractor.authenticateUser(data)

      if (result.ok && result.id) {
        const token = await jwtSign(result.id)
        setCookie(c, 'auth', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
          maxAge: 60 * 300,
          path: '/',
        })
      }

      return c.json(result, result.ok ? 200 : 400)
    }
  )

export default routes
