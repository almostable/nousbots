import { Bot, BotVersion } from '../../dal/schema'
import { BotGeneration } from '../../shared/contract'

export type CreateBotResponse =
  | { ok: true; data: { id: string } }
  | { ok: false; reason: string }

export type GetAllBotsResponse =
  | { ok: true; data: Bot[] }
  | { ok: false; reason: string }

export type GetBotByIdResponse = {
  bot: Bot
  inUse: boolean
}

export type GetMyBotResponse = {
  bot: Bot
  botVersion?: BotVersion
}

export type GenerateBotResponse = {
  result: BotGeneration
  avatarUrl: string
}
