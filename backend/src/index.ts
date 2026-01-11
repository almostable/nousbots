import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { compress } from 'hono/compress'
import auth from './unit/auth/handler'
import chat from './unit/chat/handler'
import bot from './unit/bot/handler'
import user from './unit/user/handler'
import { env } from './lib/env'

const app = new Hono().basePath('/api')

app.use(
  '*',
  cors({
    origin: ['http://localhost:3000'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
    credentials: true,
  })
)

app.use(compress())

const routes = app
  .route('/auth', auth)
  .route('/bot', bot)
  .route('/chat', chat)
  .route('/user', user)

export type AppType = typeof routes

export default {
  port: env.PORT,
  fetch: app.fetch,
  idleTimeout: 90,
}
