import { Bot, Chat, UserProgress } from '../../dal/schema'

export type User = {
  username: string
  avatarUrl: string | null
}

export type Message = {
  id: string
  content: string
  role: string
  createdAt: string
}

export type ProgressStats = {
  totalSteps: number
  completedSteps: number
  percent: number
  currentModule: string
}

export type CreateChatResponse =
  | { ok: true; id: string }
  | { ok: false; reason: string }

export type DeleteChatResponse = { ok: true } | { ok: false; reason: string }

export type GetAllChatsResponse = {
  chats: Chat[]
  bots: Bot[]
}

export type GetMessagesChatResponse =
  | {
      ok: true
      data: {
        messages: Message[]
        botId: string
        user: User
      }
    }
  | { ok: false; reason: string }

export type GetProgressChatResponse = UserProgress & {
  stats: ProgressStats
}
