import { tool } from 'ai'
import { nebiusProvider } from './llmAdapter'
import { qdrantClient } from './qdrant'
import { QDRANT_COLLECTION_NAME } from './constant'
import z from 'zod'

export function getInformationTool({
  botId,
  botVersionId,
}: {
  botId: string
  botVersionId: string
}) {
  return tool({
    description:
      'Search the course knowledge base for specific topics or definitions.',
    inputSchema: z.object({
      query: z.string().describe('The search query, e.g. "what is div tag"'),
    }),
    execute: async ({ query }) => {
      console.log(`[tool] searching for: ${query}`)

      const embeddingResponse = await nebiusProvider.embeddings.create({
        model: 'Qwen/Qwen3-Embedding-8B',
        input: query,
        encoding_format: 'float',
      })
      const queryVector = embeddingResponse.data[0].embedding

      const searchResult = await qdrantClient.search(QDRANT_COLLECTION_NAME, {
        vector: queryVector,
        limit: 3,
        filter: {
          must: [
            { key: 'bot_id', match: { value: botId } },
            { key: 'version_id', match: { value: botVersionId } },
          ],
        },
      })

      const searchResultResponse = searchResult
        .map(
          (item) =>
            `Found in ${item.payload?.location}:\n${item.payload?.content}`
        )
        .join('\n---\n')
      console.log(`[tool] received a reply: ${searchResultResponse}`)
      return searchResultResponse
    },
  })
}
