'use client'

import { useEffect, useRef, useState } from 'react'
import { useGetMessagesChat, useGetProgressChat } from '../hook/use-chat'
import { CircleAlert, RefreshCcw } from 'lucide-react'
import { GetProgressChatResponse, Message, User } from '@backend/unit/chat/type'
import clsx from 'clsx'
import { Spinner } from '@/components/ui/spinner'
import Image from 'next/image'
import { useGetBotById } from '@/features/bot/hook/use-bot'
import Link from 'next/link'
import { defaultRehypePlugins, Streamdown } from 'streamdown'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { mapToUIMessages } from '@/lib/map-ui-messages'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useQueryClient } from '@tanstack/react-query'
import { ChatInput } from './chat-input'
import { Bot } from '@backend/dal/schema'
import { streamdownComponents } from '@/components/ui/sd-components'

export function ChatPage({ id }: { id: string }) {
  const {
    data: chatData,
    isPending: isGetMessagesPending,
    isError: getMessagesError,
  } = useGetMessagesChat({ id })

  const { data: botData, isPending: isGetBotPending } = useGetBotById({
    id: chatData?.botId,
  })

  const { data: progressData } = useGetProgressChat({
    chatId: id,
  })

  if (isGetMessagesPending)
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <Spinner className="size-7" strokeWidth={1.3} />
      </div>
    )
  if (getMessagesError) return <p>Chat is not found</p>

  if (isGetBotPending)
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <Spinner className="size-7" strokeWidth={1.3} />
      </div>
    )
  if (!botData) return <p>Something went wrong</p>
  if (!progressData) return <p>Something went wrong</p>

  return (
    <ChatContent
      id={id}
      initialMessages={chatData.messages}
      botData={botData.bot}
      userData={chatData.user}
      progressData={progressData}
    />
  )
}

export function ChatContent({
  id,
  initialMessages,
  botData,
  userData,
  progressData,
}: {
  id: string
  initialMessages: Message[]
  botData: Bot
  userData: User
  progressData: GetProgressChatResponse
}) {
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const isFirstLoad = useRef(true)

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  const [input, setInput] = useState('')
  const [initalCount] = useState(initialMessages ? initialMessages.length : 0)
  const [isReady, setIsReady] = useState(false)

  const { messages, sendMessage, setMessages, status, regenerate, error } =
    useChat({
      transport: new DefaultChatTransport({
        api: 'http://localhost:3333/api/chat/message',
        credentials: 'include',
        prepareSendMessagesRequest: ({ messages }) => {
          const lastMessage = messages[messages.length - 1]
          const part = lastMessage.parts[0]
          const textContent = part?.type === 'text' ? part.text : ''

          return {
            body: {
              chatId: id,
              content: textContent,
              isFirstMessage: messages.length === 2,
            },
          }
        },
      }),

      messages: mapToUIMessages(initialMessages),
      onFinish: () => {
        queryClient.invalidateQueries({ queryKey: ['messages', id] })
        queryClient.invalidateQueries({ queryKey: ['progress', id] })
      },
    })

  const handleAction = async () => {
    if (!input.trim()) return

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role === 'user') {
      setMessages(messages.filter((m) => m.id !== lastMessage.id))
    }

    sendMessage({ text: input })
    setInput('')
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isFirstLoad) {
        scrollToBottom('auto')
        isFirstLoad.current = false
      }
      setIsReady(true)
    }, 150)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (status === 'submitted') {
      scrollToBottom('smooth')
    }
  }, [status])

  return (
    <div className="flex flex-col w-full h-screen">
      <div
        className={clsx(
          'flex-1 w-full overflow-y-auto transition-opacity duration-150 ease-out',
          isReady ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="flex justify-center w-full min-h-full">
          <div className="w-full max-w-4xl">
            <div className="flex flex-col gap-6 md:gap-10 w-full first:pt-16 last:pb-12">
              {messages.map((m, index) => {
                const isLast = index === messages.length - 1
                const isBot = m.role === 'assistant'
                const isNewMessage = index >= initalCount

                return (
                  <div
                    key={m.id}
                    className={clsx(
                      'flex w-full px-2 md:px-5',
                      m.role === 'assistant' ? 'justify-start' : 'justify-end',
                      isLast && isBot && isNewMessage ? 'min-h-[50vh]' : ''
                    )}
                  >
                    <div
                      className={clsx(
                        'flex flex-col min-w-0 gap-1',
                        m.role === 'assistant' ? 'items-start' : 'items-end'
                      )}
                    >
                      {m.role === 'assistant' && (
                        <Link href={`/app/bot/${botData?.id}`}>
                          <div className="flex items-center gap-2">
                            <div className="relative w-6 h-6">
                              <Image
                                src={botData?.avatarUrl ?? '/default.png'}
                                width={24}
                                height={24}
                                alt={botData?.avatarUrl ?? 'Nous Avatar'}
                                className="rounded-full object-cover"
                              />

                              {status === 'streaming' && isLast && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                                  <Spinner className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      )}
                      {m.role === 'user' && (
                        <div className="flex items-center gap-2">
                          <div className="rounded-full">
                            <Image
                              src={userData?.avatarUrl || '/user_default.png'}
                              width={24}
                              height={24}
                              alt={userData?.username ?? 'User Avatar'}
                              className="rounded-full"
                            />
                          </div>
                        </div>
                      )}
                      <div
                        className={clsx(
                          'bg-popover rounded-md w-fit',
                          m.role === 'user'
                            ? 'px-4 py-3 rounded-4xl mr-5 ml-[30%]'
                            : 'max-w-[calc(100%-2.5rem)] ml-7 mr-5 bg-transparent'
                        )}
                      >
                        <div className="w-fit">
                          {m.parts.map((part, idx) => {
                            if (part.type === 'text') {
                              return (
                                <Streamdown
                                  key={idx}
                                  rehypePlugins={[defaultRehypePlugins.harden]}
                                  components={
                                    status === 'streaming'
                                      ? streamdownComponents
                                      : undefined
                                  }
                                >
                                  {part.text}
                                </Streamdown>
                              )
                            }
                          })}
                        </div>
                      </div>
                      {isLast &&
                        !isBot &&
                        status !== 'streaming' &&
                        status !== 'submitted' && (
                          <Tooltip>
                            <TooltipTrigger className="mr-5" asChild>
                              <Button
                                onClick={() => regenerate()}
                                variant="ghost"
                                size="icon-sm"
                              >
                                <RefreshCcw size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>Retry</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                    </div>
                  </div>
                )
              })}

              {status === 'submitted' && (
                <div className="flex w-full px-5 justify-start min-h-[50vh]">
                  <div className="flex flex-col gap-1 items-start">
                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6">
                        <Image
                          src={botData?.avatarUrl ?? '/default.png'}
                          width={24}
                          height={24}
                          alt={botData?.avatarUrl ?? 'Nous Avatar'}
                          className="rounded-full object-cover"
                        />

                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                          <Spinner className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="ml-7 animate-pulse">Thinking...</div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex w-full px-5 justify-start min-h-[50vh]">
                  <div className="flex flex-col gap-2 items-start">
                    <div className="flex items-center gap-1.5">
                      <Image
                        src={botData?.avatarUrl ?? '/default.png'}
                        width={20}
                        height={20}
                        alt="Bot Avatar"
                        className="rounded-[10px]"
                      />
                      <span className="font-medium text-sm text-background">
                        {botData?.name}
                      </span>
                    </div>

                    <div className="items-center gap-2 text-sm ml-5 bg-red-400/15 text-red-400 px-3 p-2 rounded-2xl min-w-15 flex justify-center">
                      <CircleAlert className="size-4 " />
                      Something went wrong. Please try again or come back later.
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 items-center justify-center w-full bg-background pb-9 sm:pb-11">
        <div className="w-full max-w-4xl px-5">
          <ChatInput
            input={input}
            onChange={(e) => setInput(e.target.value)}
            onSend={handleAction}
            stats={progressData.stats}
          />
        </div>
      </div>
    </div>
  )
}
