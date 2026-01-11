import { and, eq, gt } from 'drizzle-orm'
import { db } from '../../dal'
import { users } from '../../dal/schema'
import { generateOTP } from '../../lib/genOtp'
import {
  AuthenticateUserDTO,
  ChallengeUserDTO,
  IdentifyUserDTO,
} from './contract'
import {
  AuthenticateUserResult,
  ChallengeUserResult,
  IdentifyUserResult,
} from './type'
import { verificationService } from '../../lib/verification'
import { generateUsername } from '../../lib/genUsr'

export const authInteractor = {
  identifyUser,
  challengeUser,
  authenticateUser,
}

async function identifyUser(
  data: IdentifyUserDTO
): Promise<IdentifyUserResult> {
  let user = await db.query.users.findFirst({
    where: eq(users.email, data.email),
    columns: {
      id: true,
      gender: true,
    },
  })
  if (!user) return { ok: false, reason: 'user not found' }

  return { ok: true, data: { id: user.id, gender: user.gender } }
}

async function challengeUser(
  data: ChallengeUserDTO
): Promise<ChallengeUserResult> {
  const existing = await identifyUser({ email: data.email })
  let userId: string

  if (existing.ok) {
    userId = existing.data.id
  } else {
    if (!data.gender) return { ok: false, reason: 'gender is required' }
    if (data.username) {
      const findUser = await db.query.users.findFirst({
        where: eq(users.username, data.username),
      })
      if (findUser) return { ok: false, reason: 'username must be unique' }
    }

    const uniqueUsername = generateUsername()
    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        gender: data.gender,
        username: data.username || uniqueUsername,
        avatarUrl: `https://api.dicebear.com/9.x/initials/png?seed=${data.username || uniqueUsername}`,
      })
      .returning({ id: users.id })

    userId = user.id
  }

  const code = generateOTP()
  await verificationService.saveCode(userId, code)

  console.log(`sent code: ${code}`)
  return { ok: true, message: 'confirmation code sent' }
}

async function authenticateUser(
  data: AuthenticateUserDTO
): Promise<AuthenticateUserResult> {
  const existing = await identifyUser({ email: data.email })
  if (!existing.ok) return { ok: false, reason: 'user not found' }

  const isValid = await verificationService.verifyAndBurn(
    existing.data.id,
    data.code
  )
  if (!isValid) return { ok: false, reason: 'incorrect or expired code' }

  return { ok: true, id: existing.data.id }
}
