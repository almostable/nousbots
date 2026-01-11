import { Hono } from 'hono'
import { botInteractor } from './interactor'
import { authMdw } from '../../mdw/authMdw'
import { zValidator } from '@hono/zod-validator'
import {
  GenerateBotSchema,
  DeleteBotSchema,
  GetBotByIdSchema,
  FinishBotSchema,
  GetMyBotSchema,
} from './contract'
import { AuthVariables } from '../../type/authVariables'

const app = new Hono<{ Variables: AuthVariables }>()

const routes = app
  .use('*', authMdw)
  .post('/create', async (c) => {
    const userId = c.get('userId')
    const result = await botInteractor.createBot(userId)

    return c.json(result, result.ok ? 200 : 400)
  })
  .post('/generate', zValidator('json', GenerateBotSchema), async (c) => {
    const data = c.req.valid('json')
    const userId = c.get('userId')
    const result = await botInteractor.generateBot(data, userId)

    if ('ok' in result) {
      return c.json(result.reason, 400)
    }

    return result.toUIMessageStreamResponse()
  })
  .post('/finish', zValidator('json', FinishBotSchema), async (c) => {
    const data = c.req.valid('json')
    const userId = c.get('userId')
    const result = await botInteractor.finishBot(data, userId)

    return c.json(result, result.ok ? 200 : 400)
  })
  .delete('/delete/:id', zValidator('param', DeleteBotSchema), async (c) => {
    const id = c.req.valid('param')
    const userId = c.get('userId')
    const result = await botInteractor.deleteBot(id, userId)

    return c.json(result, 200)
  })
  .get('/bots', async (c) => {
    const userId = c.get('userId')
    const result = await botInteractor.getAllBots(userId)
    return c.json(result, 200)
  })
  .get('/:id', zValidator('param', GetBotByIdSchema), async (c) => {
    const id = c.req.valid('param')
    const userId = c.get('userId')
    const result = await botInteractor.getBotById(id, userId)

    return c.json(result, result.ok ? 200 : 404)
  })
  .get('/my/bots', async (c) => {
    const userId = c.get('userId')
    const result = await botInteractor.getMyBots(userId)
    return c.json(result, 200)
  })
  .get('/my/:id', zValidator('param', GetMyBotSchema), async (c) => {
    const id = c.req.valid('param')
    const userId = c.get('userId')
    const result = await botInteractor.getMyBot(id, userId)

    return c.json(result, result.ok ? 200 : 404)
  })

export default routes
