import { Hono } from 'hono'
import { authMdw } from '../../mdw/authMdw'
import { userInteractor } from './interactor'
import { AuthVariables } from '../../type/authVariables'

const app = new Hono<{ Variables: AuthVariables }>()

const routes = app.use('*', authMdw).get('/me', async (c) => {
  const userId = c.get('userId')
  const result = await userInteractor.getCurrentUser(userId)
  return c.json(result, result.ok ? 200 : 404)
})

export default routes
