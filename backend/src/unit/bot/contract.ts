import z from 'zod'
import { modelMessageSchema } from 'ai'

export const GenerateBotSchema = z.object({
  botId: z.uuid().nonempty(),
  messages: z.array(z.any()).nonempty(),
  // prompt: z.string().nonempty(),
})

export const EditBotSchema = z.object({
  id: z.uuid().nonempty(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  persona: z.string().min(1).optional(),
  firstMessage: z.string().min(1).optional(),
  audience: z.enum(['male', 'female', 'any']).optional(),
  isPublished: z.boolean().optional(),
})

export const FinishBotSchema = z.object({
  id: z.uuid().nonempty(), // bot id
})

export const DeleteBotSchema = z.object({
  id: z.uuid().nonempty(),
})

export const GetBotByIdSchema = z.object({
  id: z.uuid().nonempty(),
})

export const GetMyBotSchema = z.object({
  id: z.uuid().nonempty(),
})

export type GenerateBotDTO = z.infer<typeof GenerateBotSchema>
export type EditBotDTO = z.infer<typeof EditBotSchema>
export type FinishBotDTO = z.infer<typeof FinishBotSchema>
export type DeleteBotDTO = z.infer<typeof DeleteBotSchema>
export type GetBotByIdDTO = z.infer<typeof GetBotByIdSchema>
export type GetMyBotDTO = z.infer<typeof GetMyBotSchema>
