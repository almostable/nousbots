import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import { db } from '../../dal'
import {
  bots,
  botVersions,
  chatMessages,
  chats,
  userProgress,
  users,
} from '../../dal/schema'
import {
  CreateChatDTO,
  DeleteChatDTO,
  GetMessagesChatDTO,
  GetProgressChatDTO,
  SendMessageChatDTO,
} from './contract'
import {
  generateChatTitle,
  nebiusProvider,
  vertexProvider,
} from '../../lib/llmAdapter'
import {
  CreateChatResponse,
  DeleteChatResponse,
  GetAllChatsResponse,
  GetMessagesChatResponse,
  GetProgressChatResponse,
  Message,
} from './type'
import { ModelMessage, stepCountIs, streamText, tool } from 'ai'
import z from 'zod'
import { qdrantClient } from '../../lib/qdrant'
import { QDRANT_COLLECTION_NAME } from '../../lib/constant'
import { getStepContent } from '../../lib/stepContent'
import { getInformationTool } from '../../lib/llmTools'
import { ApiResponse } from '../../shared/type'
import { calculateProgressStats } from '../../lib/progressCalc'
import { GoogleVertexProviderSettings, vertex } from '@ai-sdk/google-vertex'

export const chatInteractor = {
  createChat,
  sendMessageChat,
  deleteChat,
  getProgressChat,
  getAllChats,
  getMessagesChat,
}

async function createChat(
  data: CreateChatDTO,
  userId: string
): Promise<CreateChatResponse> {
  const bot = await db.query.bots.findFirst({
    where: eq(bots.id, data.id),
  })
  if (!bot) return { ok: false, reason: 'bot not found' }
  if (!bot.currentVersionId) return { ok: false, reason: 'bot is not ready' }

  const botVersion = await db.query.botVersions.findFirst({
    where: eq(botVersions.id, bot.currentVersionId),
  })
  if (!botVersion) return { ok: false, reason: 'something went wrong' }

  const [chat] = await db
    .insert(chats)
    .values({
      title: bot.name,
      botId: bot.id,
      userId: userId,
    })
    .returning({ id: chats.id })

  const [welcomeMessage] = await db
    .insert(chatMessages)
    .values({
      content: botVersion.welcomeMessage,
      role: 'model',
      chatId: chat.id,
    })
    .returning()
  if (!welcomeMessage) return { ok: false, reason: 'error creating chat' }

  await db.insert(userProgress).values({
    userId: userId,
    botId: bot.id,
    chatId: chat.id,
    botVersionId: bot.currentVersionId,
    currentModuleIdx: 0,
    currentStepIdx: 0,
  })

  return { ok: true, id: chat.id }
}

async function sendMessageChat(data: SendMessageChatDTO, userId: string) {
  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, data.chatId), eq(chats.userId, userId)),
  })
  if (!chat) return

  const bot = await db.query.bots.findFirst({
    where: eq(bots.id, chat.botId),
  })
  if (!bot) return
  if (!bot.currentVersionId) return

  const version = await db.query.botVersions.findFirst({
    where: eq(botVersions.id, bot.currentVersionId),
  })
  if (!version) return

  const progress = await db.query.userProgress.findFirst({
    where: and(
      eq(userProgress.userId, userId),
      eq(userProgress.botId, bot.id),
      eq(userProgress.botVersionId, bot.currentVersionId)
    ),
  })
  if (!progress) return

  const activeModule = version.curriculum.modules[progress.currentModuleIdx]
  const activeStep = activeModule.steps[progress.currentStepIdx]

  const activeType = getStepContent(activeStep)

  const activeStepContent = activeStep
    ? `CURRENT LESSON CONTENT:\nType: ${activeStep.type}\nText: ${activeType}`
    : 'Course finished.'

  const lastMessage = await db.query.chatMessages.findFirst({
    where: eq(chatMessages.chatId, chat.id),
    orderBy: [desc(chatMessages.createdAt)],
  })

  if (lastMessage && lastMessage.role === 'user')
    await db.delete(chatMessages).where(eq(chatMessages.id, lastMessage.id))

  const [userMessage] = await db
    .insert(chatMessages)
    .values({
      content: data.content,
      role: 'user',
      chatId: chat.id,
    })
    .returning()
  if (!userMessage) return
  await db
    .update(chats)
    .set({ lastMessageAt: userMessage.createdAt })
    .where(eq(chats.id, chat.id))

  if (data.isFirstMessage) {
    generateChatTitle(data.content)
      .then(async (generatedTitle) => {
        await db
          .update(chats)
          .set({ title: generatedTitle })
          .where(eq(chats.id, chat.id))
      })
      .catch((err) =>
        console.error('error background generating/saving chat title:', err)
      )
  }

  const recentMessagesRaw = await db.query.chatMessages.findMany({
    where: (table, { and, eq, ne }) =>
      and(eq(table.chatId, chat.id), ne(table.id, userMessage.id)),
    orderBy: [desc(chatMessages.createdAt)],
    limit: 25,
  })
  const messageHistory = recentMessagesRaw.reverse()

  const formattedHistory: ModelMessage[] = messageHistory.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }))

  if (formattedHistory.length > 0 && formattedHistory[0].role === 'assistant') {
    formattedHistory.unshift({
      role: 'user',
      content: 'SYSTEM INSTRUCTION: Start conversation with greeting.',
    })
  }

  const allMessages = [
    ...formattedHistory,
    { role: 'user', content: data.content },
  ] as ModelMessage[]

  return streamText({
    model: vertexProvider('gemini-2.5-flash'),
    stopWhen: stepCountIs(5),
    system: `
    You are a creation of Ilma. You are an AI tutor for the course "${bot.description}".

    ### 🛠 TECHNICAL CONTEXT (STRICT 0-BASED)
    These are the internal database indices. Use these EXACT values for tool calls.
    - **Current Module ID:** ${progress.currentModuleIdx} (Title: "${activeModule.title}")
    - **Current Step ID:** ${progress.currentStepIdx}

    ### 📖 CURRENT LESSON CONTENT
    ${activeStepContent}

    ### 🤖 BEHAVIOR PROTOCOL
    1. **Tool Usage (CRITICAL):** - When calling \`completeStep\`, you MUST pass the explicit **Current Module ID** and **Current Step ID** provided above.
       - DO NOT increment them. If ID is 0, send 0.

    2. **User Communication (Presentation Layer):**
       - When speaking to the student, use natural language.
       - If you refer to numbers, convert 0-based to 1-based (e.g., ID 0 -> "Module 1", ID 1 -> "Module 2").
       - *Example:* "Let's start Module 1" (even though internal ID is 0).

    3. **Interaction Flow:**
       - Guide the student through the lesson text.
       - If they understand/finish -> Call \`completeStep\`.
       - If they ask off-topic questions -> Call \`getInformation\`.

    ### YOUR PERSONA
    ${botVersions.persona}
    `,
    providerOptions: {
      vertex: {
        safetySettings: [
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
        ],
      },
    },
    messages: allMessages,
    onFinish: async (result) => {
      await db.insert(chatMessages).values({
        content: result.text,
        role: 'assistant',
        chatId: chat.id,
      })
    },
    onError: ({ error }) => {
      console.error('🔴 error during streamText:', error)
    },
    tools: {
      getInformation: getInformationTool({
        botId: bot.id,
        botVersionId: version.id,
      }),

      completeStep: tool({
        description:
          'Call this ONLY when the user successfully finishes the current step.',
        inputSchema: z.object({
          moduleIndex: z.number().describe('Current module index (0-based)'),
          stepIndex: z.number().describe('Current step index (0-based)'),
        }),
        execute: async ({ moduleIndex, stepIndex }) => {
          console.log(`[tool] completing step m${moduleIndex}_s${stepIndex}`)

          if (
            moduleIndex !== progress.currentModuleIdx ||
            stepIndex !== progress.currentStepIdx
          ) {
            return `Error: You cannot complete step m${moduleIndex}_s${stepIndex} because the user is currently at m${progress.currentModuleIdx}_s${progress.currentStepIdx}. Only complete the current step.`
          }

          const newCompletedMap: Record<string, number[]> =
            progress?.completedMap ? { ...progress.completedMap } : {}
          const mKey = moduleIndex.toString()

          if (!newCompletedMap[mKey]) {
            newCompletedMap[mKey] = []
          }

          if (!newCompletedMap[mKey].includes(stepIndex)) {
            newCompletedMap[mKey].push(stepIndex)
          }

          const modules = version.curriculum.modules
          const currentModule = modules[moduleIndex]

          let nextModuleIdx = moduleIndex
          let nextStepIdx = stepIndex
          let isCourseFinished = false
          let nextStepTitle = ''

          if (stepIndex + 1 < currentModule.steps.length) {
            nextStepIdx = stepIndex + 1
            nextStepTitle = getStepContent(currentModule.steps[nextStepIdx])
          } else if (moduleIndex + 1 < modules.length) {
            nextModuleIdx = moduleIndex + 1
            nextStepIdx = 0
            nextStepTitle = `New Module: ${modules[nextModuleIdx].title}. First step type: ${modules[nextModuleIdx].steps[nextStepIdx].type}. First step content: ${getStepContent(modules[nextModuleIdx].steps[nextStepIdx])}`
          } else {
            isCourseFinished = true
          }

          await db
            .update(userProgress)
            .set({
              completedMap: newCompletedMap,
              currentModuleIdx: nextModuleIdx,
              currentStepIdx: nextStepIdx,
              isFinished: isCourseFinished,
            })
            .where(eq(userProgress.id, progress.id))

          if (isCourseFinished)
            return 'SUCCESS: Course completed! Congratulate the user enthusiastically.'

          return `SUCCESS: Step completed.
          Moved to Module ${nextModuleIdx}, Step ${nextStepIdx}.
          Topic: "${nextStepTitle}".
          INSTRUCTION: Inform the user that the step is done and immediately proceed to teach the content of this new step.`
        },
      }),
    },
  })
}

async function deleteChat(
  data: DeleteChatDTO,
  userId: string
): Promise<DeleteChatResponse> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })
  if (!user) return { ok: false, reason: 'user not found' }

  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, data.chatId), eq(chats.userId, userId)),
  })
  if (!chat) return { ok: false, reason: 'chat not found' }

  try {
    await db.delete(chats).where(eq(chats.id, data.chatId))
    return { ok: true }
  } catch (err) {
    console.error('🔴 error while deleting chat:', err)
    return { ok: false, reason: 'something got wrong' }
  }
}

async function getProgressChat(
  data: GetProgressChatDTO
): Promise<ApiResponse<GetProgressChatResponse>> {
  const chat = await db.query.chats.findFirst({
    where: eq(chats.id, data.chatId),
  })
  if (!chat) return { ok: false, reason: 'chat not found' }

  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.chatId, data.chatId),
  })
  if (!progress) return { ok: false, reason: 'something went wrong' }

  const version = await db.query.botVersions.findFirst({
    where: eq(botVersions.id, progress.botVersionId),
  })
  if (!version) return { ok: false, reason: 'something went wrong' }

  const stats = calculateProgressStats(
    version.curriculum,
    progress.completedMap || {}
  )

  const currentModule =
    version.curriculum.modules[progress.currentModuleIdx].title

  return { ok: true, data: { ...progress, stats: { ...stats, currentModule } } }
}

async function getAllChats(
  userId: string
): Promise<ApiResponse<GetAllChatsResponse>> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
    },
  })
  if (!user) return { ok: false, reason: 'user not found' }

  const findChats = await db.query.chats.findMany({
    where: eq(chats.userId, user.id),
    orderBy: desc(chats.lastMessageAt),
  })
  if (!findChats) return { ok: false, reason: 'chats not found' }

  const botIds = findChats.map((chat) => chat.botId)
  const findBots = await db.query.bots.findMany({
    where: inArray(bots.id, botIds),
  })

  return {
    ok: true,
    data: {
      chats: findChats,
      bots: findBots,
    },
  }
}

async function getMessagesChat(
  data: GetMessagesChatDTO,
  userId: string
): Promise<GetMessagesChatResponse> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      username: true,
      avatarUrl: true,
    },
  })
  if (!user) return { ok: false, reason: 'user not found' }

  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, data.id), eq(chats.userId, userId)),
  })
  if (!chat) return { ok: false, reason: 'chat not found' }

  const messages = await db.query.chatMessages.findMany({
    where: eq(chatMessages.chatId, data.id),
    orderBy: asc(chatMessages.createdAt),
    columns: {
      id: true,
      content: true,
      role: true,
      createdAt: true,
    },
  })
  if (!messages) return { ok: false, reason: 'chat not found' }

  return {
    ok: true,
    data: {
      messages: messages as unknown as Message[],
      botId: chat.botId,
      user: user,
    },
  }
}
