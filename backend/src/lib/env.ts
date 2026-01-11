import z from 'zod'

const envSchema = z.object({
  PORT: z.string().min(1),
  PG_URL: z.url().min(1),
  REDIS_URL: z.url().min(1),
  JWT_KEY: z.string().min(1),
  VERTEX_KEY: z.string().min(1),
  QDRANT_URL: z.string().min(1),
  QDRANT_KEY: z.string().min(1),
  NEBIUS_KEY: z.string().min(1),
})

const envParse = envSchema.safeParse(process.env)

if (!envParse.success) {
  console.error(
    'invalid environment variables:',
    z.treeifyError(envParse.error)
  )
  process.exit(1)
}

export const env = envParse.data
