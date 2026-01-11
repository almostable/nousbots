'use client'

import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useGetCurrentUser } from '@/features/user/hook/use-user'
import { useGetMyBot } from '../hook/use-bot'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import clsx from 'clsx'
import { Streamdown } from 'streamdown'
import Image from 'next/image'
import { useQueryClient } from '@tanstack/react-query'

export function BotEditPage({ id }: { id: string }) {
  const queryClient = useQueryClient()
  const [input, setInput] = useState('')

  const { data, isPending: isBotPending } = useGetMyBot({ id: id })
  const {
    messages,
    sendMessage,
    status,
    error: chatError,
  } = useChat({
    transport: new DefaultChatTransport({
      api: 'http://localhost:3333/api/bot/generate',
      credentials: 'include',
      prepareSendMessagesRequest: ({ messages }) => {
        return {
          body: {
            botId: id,
            messages: messages,
          },
        }
      },
    }),
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ['myBot'] })
    },
  })

  const {
    data: currentUserData,
    isPending: isCurrentUserPending,
    isError,
    error: currentUserError,
  } = useGetCurrentUser()

  const handleAction = () => {
    if (!input.trim()) return

    sendMessage({ text: input })
    setInput('')
  }

  if (isError) return <div>service: {currentUserError.message}</div>
  if (isBotPending) return <Spinner />

  return (
    <div className="flex gap-7 w-full p-7 h-screen">
      <div className="flex flex-col gap-5 w-full">
        {chatError && <p>error: {chatError.message}</p>}
        <div className="flex flex-col gap-10">
          <p>Generate Chat</p>
          {messages.map((m) => (
            <div
              key={m.id}
              className={clsx(
                'flex',
                m.role === 'assistant'
                  ? 'justify-start'
                  : 'ml-[30%] justify-end p-2 bg-card rounded-md'
              )}
            >
              <Streamdown>
                {m.parts
                  .map((part) => (part.type === 'text' ? part.text : ''))
                  .join('')}
              </Streamdown>
            </div>
          ))}
        </div>
        <Input value={input} onChange={(e) => setInput(e.target.value)} />
        <Button onClick={handleAction}>
          {status === 'ready' ? 'Send' : <Spinner />}
        </Button>
      </div>
      <div className="flex flex-col gap-5 w-full bg-card rounded-md p-5 h-full overflow-y-scroll overflow-hidden">
        <div className="flex flex-col gap-1">
          <div className="px-2 py-0.5 text-xs text-secondary-foreground/50 font-mono">
            DISPLAYED IMAGE
          </div>
          <div className="bg-secondary text-sm w-fit rounded-md px-3 py-2">
            <Image
              src={data?.bot.avatarUrl || ''}
              alt={data?.bot.name || ''}
              width={128}
              height={128}
              className="rounded-md"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="px-2 py-0.5 text-xs text-secondary-foreground/50 font-mono">
            NAME
          </div>
          <div className="bg-secondary text-sm w-fit rounded-md px-3 py-2">
            {data?.bot.name}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="px-2 py-0.5 text-xs text-secondary-foreground/50 font-mono">
            DESCRIPTION
          </div>
          <div className="bg-secondary text-sm w-fit rounded-md px-3 py-2">
            {data?.bot.description}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="px-2 py-0.5 text-xs text-secondary-foreground/50 font-mono">
            STATUS
          </div>
          <div
            className={clsx(
              'text-sm w-fit rounded-md px-3 py-2',
              data?.bot.isPublished
                ? 'bg-emerald-400/15 text-emerald-400'
                : 'bg-red-400/15 text-red-400'
            )}
          >
            {data?.bot.isPublished
              ? 'Published and ready to use'
              : 'Not published, not ready for use'}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="px-2 py-0.5 text-xs text-secondary-foreground/50 font-mono">
            CURRICULUM
          </div>
          {data?.botVersion?.curriculum.modules.map((module, i) => {
            const stepsContent = module.steps
              .map((s) => {
                if (s.type === 'theory') return s.content
                if (s.type === 'quiz')
                  return `**Вопрос:** ${s.question}\n> Варианты: ${s.options}`
                if (s.type === 'open_question')
                  return `**Открытый вопрос:** ${s.question}`
                return ''
              })
              .join('\n\n---\n\n')

            return (
              <div key={i} className="bg-secondary p-4 rounded-md mb-5">
                <div className="font-bold cursor-pointer">{module.title}</div>

                <div className="mt-2">
                  <Streamdown>{stepsContent}</Streamdown>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
