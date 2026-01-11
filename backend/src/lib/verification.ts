import { redis } from './redis'

const KEY_PREFIX = 'verify:code:'
const CODE_TTL = 300 // 5m

export const verificationService = {
  async saveCode(userId: string, code: string) {
    const key = `${KEY_PREFIX}${userId}`
    await redis.set(key, code, 'EX', CODE_TTL)
  },

  async verifyAndBurn(userId: string, inputCode: string): Promise<boolean> {
    const key = `${KEY_PREFIX}${userId}`
    const storedCode = await redis.get(key)

    if (!storedCode) return false
    if (storedCode !== inputCode) return false

    await redis.del(key)
    return true
  },
}
