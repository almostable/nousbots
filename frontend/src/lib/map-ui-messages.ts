import { Message } from '@backend/unit/chat/type'
import { UIMessage } from 'ai'

export const mapToUIMessages = (msgs?: Message[]): UIMessage[] => {
  if (!msgs) return []

  return msgs.map((m) => {
    const role = (
      m.role === 'model' ? 'assistant' : m.role
    ) as UIMessage['role']

    return {
      id: m.id,
      role: role,
      content: m.content,
      createdAt: new Date(m.createdAt),
      parts: [{ type: 'text', text: m.content }],
    }
  })
}
