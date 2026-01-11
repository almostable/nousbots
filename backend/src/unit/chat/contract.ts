import z from 'zod'

export const CreateChatSchema = z.object({
  id: z.uuid().nonempty(),
})

export const SendMessageChatSchema = z.object({
  content: z.string().nonempty(),
  chatId: z.uuid().nonempty(),
  isFirstMessage: z.boolean().nonoptional(),
})

export const DeleteChatSchema = z.object({
  chatId: z.uuid().nonempty(),
})

export const GetProgressChatSchema = z.object({
  chatId: z.uuid().nonempty(),
})

export const GetMessagesChatSchema = z.object({
  id: z.uuid().nonempty(),
})

export type CreateChatDTO = z.infer<typeof CreateChatSchema>
export type SendMessageChatDTO = z.infer<typeof SendMessageChatSchema>
export type DeleteChatDTO = z.infer<typeof DeleteChatSchema>
export type GetMessagesChatDTO = z.infer<typeof GetMessagesChatSchema>
export type GetProgressChatDTO = z.infer<typeof GetProgressChatSchema>
