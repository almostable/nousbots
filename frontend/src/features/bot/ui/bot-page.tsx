'use client'

import { Button } from '@/components/ui/button'
import { useGetBotById } from '../hook/use-bot'
import { Spinner } from '@/components/ui/spinner'
import { useCreateChat } from '@/features/chat/hook/use-chat'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function BotPage({ id }: { id: string }) {
  const { data: botData, isPending, error } = useGetBotById({ id })
  const { createChat, isCreateChatPending, createChatError } = useCreateChat()

  const router = useRouter()

  if (isPending) return <Spinner />
  if (!botData) return <div>service: {error?.message}</div>

  const handleAction = async () => {
    if (botData.inUse) return

    const chat = await createChat({ id })
    router.push(`/app/chat/${chat}`)
    toast(`Chat with ${botData.bot.name} created`)
  }

  return (
    <div className="flex flex-col gap-2">
      <span>{botData.bot.name}</span>
      <span>{botData.bot.description}</span>
      <Button
        type="button"
        onClick={handleAction}
        className="w-fit"
        disabled={botData.inUse}
      >
        {botData.inUse ? 'Already created' : `Talk with ${botData.bot.name}`}
      </Button>
    </div>
  )
}
