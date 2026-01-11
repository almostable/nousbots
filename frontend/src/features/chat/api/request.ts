import { client } from '@/shared/api/client'
import {
  CreateChatDTO,
  DeleteChatDTO,
  GetMessagesChatDTO,
  GetProgressChatDTO,
} from '@backend/unit/chat/contract'

async function createChat(data: CreateChatDTO) {
  const res = await client.api.chat.create.$post({ json: data })
  const json = await res.json()

  if (!json.ok) throw new Error(json.reason)
  return json.id
}

async function deleteChat(data: DeleteChatDTO) {
  const res = await client.api.chat.message[':chatId'].$delete({ param: data })
  const json = await res.json()

  if (!json.ok) throw new Error(json.reason)
  return json
}

async function getProgressChat(data: GetProgressChatDTO) {
  const res = await client.api.chat.progress[':chatId'].$get({ param: data })
  const json = await res.json()

  if (!json.ok) throw new Error(json.reason)
  return json.data
}

async function getAllChats() {
  const res = await client.api.chat.all.$get()
  const json = await res.json()

  if (!json.ok) throw new Error(json.reason)
  return json.data
}

async function getMessagesChat(data: GetMessagesChatDTO) {
  const res = await client.api.chat[':id'].$get({ param: data })
  const json = await res.json()

  if (!json.ok) throw new Error(json.reason)
  return json.data
}

export { createChat, deleteChat, getProgressChat, getAllChats, getMessagesChat }
