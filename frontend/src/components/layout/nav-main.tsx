'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { HugeiconsIcon } from '@hugeicons/react'
import { DiscoverCircleIcon, LayerAddIcon } from '@hugeicons/core-free-icons'

export function NavMain() {
  const p = usePathname()

  return (
    <div className="flex flex-col gap-1">
      <Link href={'/app'}>
        <div
          className={clsx(
            'flex items-center gap-2.5 px-4 py-2.5 w-full rounded-md hover:bg-accent',
            p === '/app' ? 'bg-sidebar-accent' : ''
          )}
        >
          <HugeiconsIcon icon={DiscoverCircleIcon} size={18} />
          <span>Discover</span>
        </div>
      </Link>
      <Link href={'/app/bot/my'}>
        <div
          className={clsx(
            'flex items-center gap-2.5 px-4 py-2.5 w-full rounded-md hover:bg-accent',
            p === '/app/bot/my' ? 'bg-sidebar-accent' : ''
          )}
        >
          <HugeiconsIcon icon={LayerAddIcon} size={18} />
          <span>My Ilma</span>
        </div>
      </Link>
    </div>
  )
}
