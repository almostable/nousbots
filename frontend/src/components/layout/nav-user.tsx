import { useGetCurrentUser } from '@/features/user/hook/use-user'
import { LogOut, Sparkle } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import Image from 'next/image'
import { useLogoutUser } from '@/features/auth/hook/use-auth'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  BubbleChatQuestionIcon,
  LayerAddIcon,
  Settings01Icon,
} from '@hugeicons/core-free-icons'

export function NavUser() {
  const { data: currentUserData, isPending: isCurrentUserPending } =
    useGetCurrentUser()
  const { mutateAsync: logoutUser } = useLogoutUser()
  return (
    <div>
      {isCurrentUserPending ? (
        <Skeleton className="h-10 w-20" />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer">
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-accent rounded-md">
                <Image
                  src={currentUserData?.avatarUrl || '/user_default.png'}
                  alt={currentUserData?.username || ''}
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {currentUserData?.username}
                  </span>
                  <span className="text-xs text-neutral-500">Free</span>
                </div>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-63">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Image
                  src={currentUserData?.avatarUrl || '/user_default.png'}
                  alt={currentUserData?.username || ''}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {/*<DropdownMenuItem>
                <HugeiconsIcon icon={LayerAddIcon} />
                My Ilma
              </DropdownMenuItem>*/}
              <DropdownMenuItem>
                <Sparkle strokeWidth="1.5" />
                Subscription
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={Settings01Icon} />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={BubbleChatQuestionIcon} />
                Get help
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={() => logoutUser()}
                variant="destructive"
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
