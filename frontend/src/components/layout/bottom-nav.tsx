'use client'

import { useGetCurrentUser } from '@/features/user/hook/use-user'
import clsx from 'clsx'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  DiscoverCircleIcon,
  LayerAddIcon,
  MessageMultiple01Icon,
} from '@hugeicons/core-free-icons'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Skeleton } from '../ui/skeleton'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const navList = [
  {
    title: 'Discover',
    url: '/app',
    icon: DiscoverCircleIcon,
  },
  {
    title: 'My Ilma',
    url: '/app/bot/my',
    icon: LayerAddIcon,
  },
  {
    title: 'Chats',
    url: '/app/chats',
    icon: MessageMultiple01Icon,
  },
]

export function NavBottom() {
  const pathname = usePathname()
  const { data: currentUserData, isPending: isCurrentUserPending } =
    useGetCurrentUser()

  const [activePath, setActivePath] = useState(pathname)

  useEffect(() => {
    setActivePath(pathname)
  }, [pathname])

  const ActiveBg = () => (
    <motion.div
      layoutId="active-nav-pill"
      className="absolute inset-0 bg-foreground/10 rounded-md"
      transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
    />
  )

  if (pathname.startsWith('/app/chat/')) return

  return (
    <div className="fixed bottom-7 w-full md:hidden">
      <div className="flex justify-center items-center w-full">
        <div className="flex items-center rounded-md bg-sidebar-accent/70 backdrop-blur-xs w-fit relative z-0">
          {navList.map((i) => {
            const isActive = activePath === i.url
            return (
              <Link
                onPointerDown={() => setActivePath(i.url)}
                key={i.title}
                href={i.url}
                className="relative px-5 py-2"
              >
                {isActive && <ActiveBg />}
                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  {i.icon && <HugeiconsIcon icon={i.icon} size={21} />}
                  <span className="text-[10px] font-medium">{i.title}</span>
                </div>
              </Link>
            )
          })}

          <Link href={'/profile'}>
            <div
              className={clsx(
                'flex flex-col items-center gap-0.5 px-5 py-2 rounded-md',
                pathname === '/profile' && 'bg-foreground/10'
              )}
            >
              {isCurrentUserPending ? (
                <Skeleton className="w-5.25 h-5.25" />
              ) : (
                <Image
                  src={currentUserData?.avatarUrl || '/user_default.png'}
                  alt={currentUserData?.username || 'who'}
                  width={21}
                  height={21}
                  className="rounded-full"
                />
              )}
              <span className="text-[10px] font-medium max-w-11 truncate">
                Profile
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
