import { InferSelectModel } from 'drizzle-orm'
import { users } from '../../dal/schema'

type DBUser = InferSelectModel<typeof users>

export type User = Omit<DBUser, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string | null
}

export type GetUserResponse =
  | { ok: true; data: User }
  | { ok: false; reason: string }
