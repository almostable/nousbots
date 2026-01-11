'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useDeleteChat, useGetAllChats } from '../hook/use-chat'
import { toast } from 'sonner'
import Image from 'next/image'
import clsx from 'clsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Ellipsis } from 'lucide-react'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ChatSkeleton } from './chat-skeleton'
import { Delete02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

type ChatData = {
  id: string
  title: string
}

export function ChatList({ isMobile = false }: { isMobile?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const [chatToDelete, setChatToDelete] = useState<ChatData | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const { data: chatsData, isPending: isChatsPending } = useGetAllChats()
  const { mutateAsync, isPending, isError, error } = useDeleteChat()

  const handleAction = async () => {
    if (!chatToDelete) return

    await mutateAsync({ chatId: chatToDelete.id })
    toast.success(`Chat ${chatToDelete.title} deleted`)
    setChatToDelete(null)
    router.replace('/app')
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        {isChatsPending && isMobile && (
          <>
            <ChatSkeleton />
            <ChatSkeleton />
            <ChatSkeleton />
            <ChatSkeleton />
            <ChatSkeleton />
            <ChatSkeleton />
            <ChatSkeleton />
            <ChatSkeleton />
            <ChatSkeleton />
            <ChatSkeleton />
          </>
        )}

        {chatsData?.chats.map((chat) => {
          const isActive = pathname.startsWith(`/app/chat/${chat.id}`)

          const bot = chatsData.bots.find((b) => b.id === chat.botId)
          if (!bot) return null

          return (
            <div
              key={chat.id}
              className={clsx(
                'flex items-center justify-between relative px-4 py-2 hover:bg-accent rounded-md gap-2',
                isActive ? 'bg-sidebar-accent' : ''
              )}
            >
              <Link href={`/app/chat/${chat.id}`} className="w-full min-w-0">
                <div className="flex items-center justify-between gap-5 w-full">
                  <div className="flex items-center gap-3 min-w-0">
                    <Image
                      src={bot.avatarUrl || ''}
                      alt={bot.name}
                      width={isMobile ? 48 : 24}
                      height={isMobile ? 48 : 24}
                      className={clsx('rounded-full shrink-0')}
                    />
                    <div className="flex flex-col min-w-0">
                      <span
                        className={clsx(
                          'block truncate font-medium',
                          isMobile ? 'text-base' : 'text-sm'
                        )}
                      >
                        {chat.title}
                      </span>
                      <span className="text-xs text-neutral-500 truncate">
                        {bot.name}
                        {/*{formatDistanceToNowStrict(
                            new Date(chat.lastMessageAt),
                            {
                              addSuffix: true,
                              locale: enUS,
                            }
                          )}*/}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="h-full">
                    <div
                      className={clsx(
                        'flex justify-center items-center hover:text-white hover:bg-secondary data-[state=open]:text-white data-[state=open]:bg-secondary p-1 rounded-4xl cursor-pointer',
                        isMobile ? '' : 'text-transparent'
                      )}
                    >
                      <Ellipsis size={16} />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="center">
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => {
                        setChatToDelete({
                          id: chat.id,
                          title: chat.title,
                        })
                        setIsAlertOpen(true)
                      }}
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={18} />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )
        })}
      </div>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setChatToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAction} variant="destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
