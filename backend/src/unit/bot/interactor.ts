import { and, desc, eq, or } from 'drizzle-orm'
import { db } from '../../dal'
import { Bot, bots, botVersions, userProgress, users } from '../../dal/schema'
import {
  DeleteBotDTO,
  FinishBotDTO,
  GenerateBotDTO,
  GetBotByIdDTO,
  GetMyBotDTO,
} from './contract'
import {
  GenerateBotResponse,
  GetBotByIdResponse,
  GetMyBotResponse,
} from './type'
import {
  convertToModelMessages,
  generateText,
  ModelMessage,
  stepCountIs,
  streamText,
  tool,
} from 'ai'
import { nebiusProvider, vertexProvider } from '../../lib/llmAdapter'
import { BotGenerationSchema } from '../../shared/contract'
import {
  ARCHITECT_SYSTEM_PROMPT,
  BOT_GENERATE_SYSTEM_PROMPT,
  QDRANT_COLLECTION_NAME,
} from '../../lib/constant'
import { qdrantClient } from '../../lib/qdrant'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { GoogleGenerativeAIProviderOptions } from '@ai-sdk/google'
import { ApiResponse } from '../../shared/type'
import z from 'zod'

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1200,
  chunkOverlap: 200,
})

export const botInteractor = {
  createBot,
  generateBot,
  finishBot,
  deleteBot,
  getAllBots,
  getBotById,
  getMyBots,
  getMyBot,
}

async function createBot(userId: string): Promise<ApiResponse<Bot>> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })
  if (!user) return { ok: false, reason: 'user not found' }

  const [bot] = await db
    .insert(bots)
    .values({
      name: `${user.username}'s New Bot`,
      audience: 'any',
      avatarUrl: `https://api.dicebear.com/9.x/glass/png?seed=${user.username}'s New Bot`,
      creatorId: user.id,
    })
    .returning()
  if (!bot) return { ok: false, reason: 'failed to create bot' }

  return { ok: true, data: bot }
}

async function generateBot(data: GenerateBotDTO, userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      gender: true,
    },
  })
  if (!user) return { ok: false, reason: 'user not found' }

  const bot = await db.query.bots.findFirst({
    where: and(eq(bots.id, data.botId), eq(bots.creatorId, userId)),
  })
  if (!bot) return { ok: false, reason: 'bot not found' }

  let currentJson = null
  if (bot.currentVersionId) {
    const version = await db.query.botVersions.findFirst({
      where: eq(botVersions.id, bot.currentVersionId),
    })

    if (version) {
      const prepare = {
        name: bot.name,
        description: bot.description,
        persona: version.persona,
        welcomeMessage: version.welcomeMessage,
        curriculum:
          typeof version.curriculum === 'string'
            ? JSON.parse(version.curriculum)
            : version.curriculum,
      }

      currentJson = JSON.stringify(prepare, null, 2)
    }
  }

  return streamText({
    model: vertexProvider('gemini-3-flash-preview'),
    providerOptions: {
      vertex: {
        thinkingConfig: {
          thinkingLevel: 'high',
          includeThoughts: true,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
        ],
      } satisfies GoogleGenerativeAIProviderOptions,
    },
    system: ARCHITECT_SYSTEM_PROMPT(currentJson),
    messages: await convertToModelMessages(data.messages as any),
    stopWhen: stepCountIs(5),
    tools: {
      save_course: tool({
        description:
          'Call this tool FINALIZES the course creation/update. Use it only when you have a complete course structure ready to be saved.',
        inputSchema: z.object({
          json_string: z
            .string()
            .describe(
              'The FULL, VALID JSON string of the CourseBot object. Must match the TypeScript interface exactly. No Markdown formatting inside.'
            ),
        }),
        execute: async ({ json_string }) => {
          console.log('[tool] save_course called:', json_string)

          let rawData
          try {
            rawData = JSON.parse(json_string)
          } catch (e) {
            return {
              status: 'error',
              reason:
                'CRITICAL: The string you provided is not valid JSON. Please fix syntax (quotes, commas) and try again.',
            }
          }

          const validation = BotGenerationSchema.safeParse(rawData)
          if (!validation.success) {
            const errorDetails = validation.error.issues
              .map((i) => `${i.path.join('.')} : ${i.message}`)
              .join('; ')

            return {
              status: 'error',
              reason: `VALIDATION FAILED: The JSON is valid syntax, but implies wrong structure. Fix these errors: ${errorDetails}`,
            }
          }

          const validData = validation.data

          try {
            const [createBotVersion] = await db
              .insert(botVersions)
              .values({
                botId: bot.id,
                persona: validData.persona,
                welcomeMessage: validData.welcomeMessage,
                curriculum: validData.curriculum,
              })
              .returning({ id: botVersions.id })

            await db
              .update(bots)
              .set({
                name: validData.name,
                description: validData.description,
                avatarUrl: `https://api.dicebear.com/9.x/glass/png?seed=${validData.name}`,
                currentVersionId: createBotVersion.id,
              })
              .where(eq(bots.id, data.botId))

            return {
              status: 'success',
              course_name: validData.name,
              module_count: validData.curriculum.modules.length,
              message: 'Bot saved successfully. Inform the user.',
            }
          } catch (dbError) {
            console.error('db error:', dbError)
            return {
              status: 'error',
              reason:
                'Internal Database Error. The course was valid but could not be saved. Ask user to try again later.',
            }
          }
        },
      }),
    },
  })
}

// async function updateBot() {
//   if (data.audience && data.audience !== user.gender && data.audience !== 'any')
//     return { ok: false, reason: 'invalid audience' }
// }

async function finishBot(data: FinishBotDTO, userId: string) {
  try {
    const bot = await db.query.bots.findFirst({
      where: and(eq(bots.id, data.id), eq(bots.creatorId, userId)),
    })
    if (!bot) return { ok: false, reason: 'bot not found' }
    if (!bot.currentVersionId) return { ok: false, reason: 'no active version' }

    const botVersion = await db.query.botVersions.findFirst({
      where: eq(botVersions.id, bot.currentVersionId),
    })
    if (!botVersion) return { ok: false, reason: 'version not found' }

    const collections = await qdrantClient.getCollections()
    if (
      !collections.collections.find((c) => c.name === QDRANT_COLLECTION_NAME)
    ) {
      await qdrantClient.createCollection(QDRANT_COLLECTION_NAME, {
        vectors: {
          size: 4096,
          distance: 'Cosine',
        },
      })
    }

    for (const [mIndex, module] of botVersion?.curriculum.modules.entries()) {
      for (const [sIndex, step] of module.steps.entries()) {
        let searchableText
        if (step.type === 'theory') searchableText = step.content
        if (step.type === 'quiz')
          searchableText = `Test question: ${step.question}. Correct answer: ${step.correctAnswer}. Explanation of the correct answer: ${step.explanation}.}`
        if (step.type === 'open_question')
          searchableText = `Task: ${step.question}. Criterion for a correct answer: ${step.validationCriteria}.`

        if (!searchableText) {
          console.warn(`[skip] step ${sIndex} in module ${mIndex} has no text`)
          continue
        }

        try {
          const chunks = await splitter.createDocuments([searchableText])
          const textsToEmbed = chunks.map((c) => c.pageContent)
          const embeddingResponse = await nebiusProvider.embeddings.create({
            model: 'Qwen/Qwen3-Embedding-8B',
            input: textsToEmbed,
            encoding_format: 'float',
          })
          const embeddings = embeddingResponse.data.map(
            (item) => item.embedding
          )

          const points = chunks.map((chunk, cIndex) => ({
            id: crypto.randomUUID(),
            vector: embeddings[cIndex],
            payload: {
              bot_id: bot.id,
              version_id: botVersion.id,
              module_index: mIndex,
              step_index: sIndex,
              type: step.type,
              content: chunk.pageContent,
              location: `Module: ${module.title}, Step number: ${sIndex + 1}`,
            },
          }))

          // await qdrantClient.delete(QDRANT_COLLECTION_NAME, {
          //   filter: {
          //     must: [{ key: 'bot_id', match: { value: bot.id } }],
          //     must_not: [
          //       { key: 'version_id', match: { value: botVersion.id } },
          //     ],
          //   },
          // })

          // if (!botVersion.isVectorized) {
          //   await qdrantClient.delete(QDRANT_COLLECTION_NAME, {
          //     filter: {
          //       must: [
          //         { key: 'bot_id', match: { value: bot.id } },
          //         { key: 'version_id', match: { value: botVersion.id } },
          //       ],
          //     },
          //   })
          // }

          await qdrantClient.upsert(QDRANT_COLLECTION_NAME, {
            points: points,
          })

          await db
            .update(botVersions)
            .set({
              isVectorized: true,
            })
            .where(eq(botVersions.id, bot.currentVersionId))
        } catch (e) {
          console.error(
            `[error] failed at module ${mIndex}, step ${sIndex}:`,
            e
          )
          throw e
        }
      }
    }

    return { ok: true }
  } catch (e: any) {
    console.error('raw error:', e)
    return { ok: false, reason: 'something went wrong' }
  }
}

async function deleteBot(data: DeleteBotDTO, userId: string) {
  const [bot] = await db
    .delete(bots)
    .where(and(eq(bots.id, data.id), eq(bots.creatorId, userId)))
    .returning()
  if (!bot) return { ok: false, reason: 'bot not found' }

  return { ok: true, data: bot.id }
}

async function getAllBots(userId: string): Promise<ApiResponse<Bot[]>> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      gender: true,
    },
  })
  if (!user) return { ok: false, reason: 'user not found' }

  const findBots = await db.query.bots.findMany({
    where: and(
      eq(bots.isPublished, true),
      or(eq(bots.audience, user.gender), eq(bots.audience, 'any'))
    ),
    limit: 10,
    orderBy: [desc(bots.createdAt)],
  })

  return { ok: true, data: findBots }
}

async function getBotById(
  data: GetBotByIdDTO,
  userId: string
): Promise<ApiResponse<GetBotByIdResponse>> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      gender: true,
    },
  })
  if (!user) return { ok: false, reason: 'user not found' }

  const bot = await db.query.bots.findFirst({
    where: and(
      eq(bots.id, data.id),
      or(eq(bots.audience, user.gender), eq(bots.audience, 'any'))
    ),
  })
  if (!bot) return { ok: false, reason: 'bot not found' }

  const progress = await db.query.userProgress.findFirst({
    where: and(eq(userProgress.userId, userId), eq(userProgress.botId, bot.id)),
  })

  const inUse = !!progress

  return { ok: true, data: { bot: bot, inUse: inUse } }
}

async function getMyBots(userId: string): Promise<ApiResponse<Bot[]>> {
  const myBots = await db.query.bots.findMany({
    where: eq(bots.creatorId, userId),
  })

  return { ok: true, data: myBots }
}

async function getMyBot(
  data: GetMyBotDTO,
  userId: string
): Promise<ApiResponse<GetMyBotResponse>> {
  const bot = await db.query.bots.findFirst({
    where: and(eq(bots.id, data.id), eq(bots.creatorId, userId)),
  })
  if (!bot) return { ok: false, reason: 'bot not found' }

  let botVersion
  if (bot.currentVersionId) {
    botVersion = await db.query.botVersions.findFirst({
      where: eq(botVersions.id, bot.currentVersionId),
    })
  }

  return { ok: true, data: { bot: bot, botVersion: botVersion } }
}
