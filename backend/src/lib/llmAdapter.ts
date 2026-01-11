import { generateText } from 'ai'
import OpenAI from 'openai'
import { env } from './env'
import { createVertex } from '@ai-sdk/google-vertex'

export const vertexProvider = createVertex({
  apiKey: env.VERTEX_KEY,
})

export const nebiusProvider = new OpenAI({
  baseURL: 'https://api.tokenfactory.nebius.com/v1/',
  apiKey: env.NEBIUS_KEY,
})

async function generateChatTitle(message: string) {
  const result = await generateText({
    model: vertexProvider('gemini-2.5-flash-lite'),
    prompt: `Придумай короткое и максимально ясное название чата (5-7 слов) на основе этого сообщения. Верни только текст названия без лишних слов. Сообщение: "${message}"`,
  })

  return result.text
}

export { generateChatTitle }
