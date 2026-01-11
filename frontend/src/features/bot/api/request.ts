import { client } from '@/shared/api/client'
import { GetBotByIdDTO, GetMyBotDTO } from '@backend/unit/bot/contract'

export async function createBot() {
  const res = await client.api.bot.create.$post()
  const json = await res.json()

  if (!json.ok) throw new Error(json.reason)
  return json.data
}

export async function getAllBots() {
  const res = await client.api.bot.bots.$get()
  const json = await res.json()

  if (!json.ok) throw new Error(json.reason)
  return json.data
}

export async function getBotById(data: GetBotByIdDTO) {
  const res = await client.api.bot[':id'].$get({
    param: { id: data.id },
  })
  const json = await res.json()

  if (!json.ok) throw new Error(json.reason)
  return json.data
}

export async function getMyBots() {
  const res = await client.api.bot.my.bots.$get()
  const json = await res.json()

  if (!json.ok) throw new Error(json.reason)
  return json.data
}

export async function getMyBot(data: GetMyBotDTO) {
  const res = await client.api.bot.my[':id'].$get({ param: { id: data.id } })
  const json = await res.json()

  if (!json.ok) throw new Error(json.reason)
  return json.data
}
