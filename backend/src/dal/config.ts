import { defineConfig } from 'drizzle-kit'
import { env } from '../lib/env'

export default defineConfig({
  out: './src/dal/drizzle',
  schema: './src/dal/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.PG_URL,
  },
})
