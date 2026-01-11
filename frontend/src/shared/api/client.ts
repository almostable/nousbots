import { hc } from 'hono/client'
import type { AppType } from '@backend/index'

export const client = hc<AppType>('http://localhost:3333', {
  init: {
    credentials: 'include',
  },
})
