import { Hono } from 'hono'
import { authMdw } from '../../mdw/authMdw'
import { zValidator } from '@hono/zod-validator'
import {
  CreateChatSchema,
  DeleteChatSchema,
  GetMessagesChatSchema,
  GetProgressChatSchema,
  SendMessageChatSchema,
} from './contract'
import { chatInteractor } from './interactor'
import { AuthVariables } from '../../type/authVariables'

const app = new Hono<{ Variables: AuthVariables }>()

const routes = app
  .use('*', authMdw)
  .post('/create', zValidator('json', CreateChatSchema), async (c) => {
    const data = c.req.valid('json')
    const userId = c.get('userId')

    const result = await chatInteractor.createChat(data, userId)
    return c.json(result, result.ok ? 201 : 500)
  })
  .post('/message', zValidator('json', SendMessageChatSchema), async (c) => {
    const data = c.req.valid('json')
    const userId = c.get('userId')

    const result = await chatInteractor.sendMessageChat(data, userId)
    return result?.toUIMessageStreamResponse()
  })
  .delete(
    '/message/:chatId',
    zValidator('param', DeleteChatSchema),
    async (c) => {
      const data = c.req.valid('param')
      const userId = c.get('userId')

      const result = await chatInteractor.deleteChat(data, userId)
      return c.json(result, result.ok ? 200 : 400)
    }
  )
  .get(
    '/progress/:chatId',
    zValidator('param', GetProgressChatSchema),
    async (c) => {
      const data = c.req.valid('param')

      const result = await chatInteractor.getProgressChat(data)
      return c.json(result, result.ok ? 200 : 404)
    }
  )
  .get('/all', async (c) => {
    const userId = c.get('userId')
    const result = await chatInteractor.getAllChats(userId)
    return c.json(result, result.ok ? 200 : 404)
  })
  .get('/:id', zValidator('param', GetMessagesChatSchema), async (c) => {
    const chatId = c.req.valid('param')
    const userId = c.get('userId')

    const result = await chatInteractor.getMessagesChat(chatId, userId)
    return c.json(result, result.ok ? 200 : 404)
  })

export default routes
