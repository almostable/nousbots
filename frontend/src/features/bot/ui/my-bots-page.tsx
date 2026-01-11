'use client'

import { useRouter } from 'next/navigation'
import { useCreateBot, useGetMyBots } from '../hook/use-bot'
import { HugeiconsIcon } from '@hugeicons/react'
import { AddCircleHalfDotIcon } from '@hugeicons/core-free-icons'
import { Spinner } from '@/components/ui/spinner'
import Image from 'next/image'
import Link from 'next/link'

export function MyBotsPage() {
  const router = useRouter()
  const { data, isPending: isBotsPending, error: botsError } = useGetMyBots()
  const {
    mutate,
    isPending: isCreatePending,
    error: createError,
  } = useCreateBot()

  const handleCreate = () => {
    mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/app/bot/edit/${data.id}`)
      },
    })
  }
  return (
    <div className="flex flex-col gap-5 h-full p-5 md:p-7">
      <h1 className="text-2xl font-medium">My Ilma</h1>
      {isBotsPending ? (
        <div className="flex justify-center items-center h-full">
          <Spinner className="size-7" strokeWidth={1.3} />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div
            onClick={handleCreate}
            className="flex flex-col gap-3 p-5 justify-center items-center rounded-md text-center bg-card/90 hover:bg-card text-card-foreground/50 hover:text-card-foreground cursor-pointer"
          >
            <HugeiconsIcon icon={AddCircleHalfDotIcon} size={64} />
            Create Ilma
          </div>
          {data?.map((bot) => (
            <Link
              href={`/app/bot/edit/${bot.id}`}
              key={bot.id}
              className="flex flex-col gap-3 p-5 min-w-0 justify-center items-center rounded-md text-center bg-card/90 hover:bg-card text-card-foreground/50 hover:text-card-foreground cursor-pointer"
            >
              <Image
                src={bot.avatarUrl}
                alt={bot.name}
                width={64}
                height={64}
                className="rounded-md"
              />
              <span className="truncate w-full">{bot.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
