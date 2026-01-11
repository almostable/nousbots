import { client } from '@/shared/api/client'

export async function getCurrentUser() {
  const res = await client.api.user.me.$get()
  const json = await res.json()

  if (!json.ok) throw new Error(json.reason)
  return json.data
}
