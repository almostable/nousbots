import { Skeleton } from '@/components/ui/skeleton'

export function ChatSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="w-40 h-5" />
          <Skeleton className="w-20 h-3" />
        </div>
      </div>
      <Skeleton className="w-6 h-4 rounded-lg" />
    </div>
  )
}
