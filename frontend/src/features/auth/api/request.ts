import { client } from '@/shared/api/client'
import {
  AuthenticateUserDTO,
  ChallengeUserDTO,
  IdentifyUserDTO,
} from '@backend/unit/auth/contract'

async function identifyUser(data: IdentifyUserDTO) {
  const res = await client.api.auth.identify.$post({ json: data })
  return res.json()
}

async function logoutUser() {
  const res = await client.api.auth.logout.$post()
  return res.json()
}

async function challengeUser(data: ChallengeUserDTO) {
  const res = await client.api.auth.challenge.$post({ json: data })
  return res.json()
}

async function authenticateUser(data: AuthenticateUserDTO) {
  const res = await client.api.auth.authenticate.$post({ json: data })
  return res.json()
}

export { identifyUser, logoutUser, challengeUser, authenticateUser }
