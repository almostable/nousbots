'use client'

import { useGetAllBots } from '../hook/use-bot'
import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

export function BotsPage() {
  const { data, isPending, isError, error } = useGetAllBots()

  if (isError) return <div>network error: {error.message}</div>

  return (
    <div className="flex flex-col gap-2 p-5 md:p-7">
      <div className="flex items-center gap-4 w-full">
        <h1 className="text-2xl font-medium">Explore Ilma</h1>
      </div>
      {isPending && (
        <div className="flex justify-center items-center w-full h-screen">
          <Spinner className="size-7" strokeWidth={1.3} />
        </div>
      )}
      {!data || data.length === 0 ? (
        <div className="flex justify-center items-center w-full h-screen">
          <span className="text-card-foreground/30">Nothing</span>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-2 gap-6 xl:gap-8 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {data.map((bot) => (
            <Link key={bot.id} href={`app/bot/${bot.id}`}>
              <div className="flex flex-col justify-center items-center gap-2.5 hover:animate-pulse">
                <Image
                  src={
                    bot.avatarUrl ||
                    'https://api.dicebear.com/9.x/identicon/svg?seed=Kingston'
                  }
                  width={150}
                  height={150}
                  alt={bot.name}
                  className="rounded-2xl w-full max-w-full"
                />
                <div className="flex flex-col gap-0.5 w-full max-w-full px-2">
                  <span className="text-base">{bot.name}</span>
                  <span className="text-foreground/30 text-xs line-clamp-2">
                    {bot.description}
                  </span>
                  <span className="text-neutral-500 text-xs line-clamp-2 pt-2">
                    {bot.isVerified && (
                      <div className="flex items-center gap-1 bg-blue-400/20 text-blue-400 w-fit px-2 py-1 rounded-4xl">
                        <BadgeCheck size={14} />
                        <span>Verified</span>
                      </div>
                    )}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
