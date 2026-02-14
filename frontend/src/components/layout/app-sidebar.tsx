'use client'

import { BrandLogo } from '../icon/brand-logo'
import { NavMain } from './nav-main'
import { NavUser } from './nav-user'
import { ChatList } from '@/features/chat/ui/chat-list'

export function AppSidebar() {
  return (
    <div className="hidden md:flex flex-col justify-between bg-sidebar h-screen w-full max-w-75 p-2 pt-4">
      <div className="flex flex-col items-start gap-6">
        <div className="px-3.5 py-2 pb-2.5 hover:bg-accent rounded-md cursor-pointer">
          <BrandLogo height={30} />
        </div>
        <div className="w-full">
          <NavMain />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <span className="text-sm ml-4 text-foreground/40 font-medium  ">
            In progress
          </span>
          <ChatList />
        </div>
      </div>
      <NavUser />
    </div>
  )
}
