import { eq } from 'drizzle-orm'
import { db } from '../../dal'
import { User, users } from '../../dal/schema'
import { ApiResponse } from '../../shared/type'

export const userInteractor = {
  getCurrentUser,
}

async function getCurrentUser(userId: string): Promise<ApiResponse<User>> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })
  if (!user) return { ok: false, reason: 'user not found' }

  return { ok: true, data: user }
}
