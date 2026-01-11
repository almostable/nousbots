'use client'

import { ChatList } from './chat-list'

export function ChatsPage() {
  return (
    <div className="h-full">
      <div className="md:hidden">
        <p className="text-2xl font-medium p-5 pb-2">Chats</p>
        <div className="px-2">
          <ChatList isMobile={true} />
        </div>
      </div>

      <div className="hidden md:flex justify-center items-center h-full text-neutral-500">
        <p>Select a conversation from the sidebar</p>
      </div>
    </div>
  )
}
