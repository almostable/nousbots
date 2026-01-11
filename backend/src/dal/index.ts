import { drizzle } from 'drizzle-orm/bun-sql'
import * as schema from './schema'
import { env } from '../lib/env'

export const db = drizzle(env.PG_URL, { schema })
