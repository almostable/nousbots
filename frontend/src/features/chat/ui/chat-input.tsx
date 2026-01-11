import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowUp02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { ChangeEvent } from 'react'
import { ChatProgress } from './chat-progress'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ProgressStats } from '@backend/unit/chat/type'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

export function ChatInput({
  input,
  onChange,
  onSend,
  stats,
}: {
  input: string
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onSend: () => void
  stats: ProgressStats
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (input.trim().length > 0) {
        onSend()
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSend()
  }
  return (
    <form
      className="flex flex-col gap-4 bg-popover rounded-lg p-5"
      onSubmit={handleSubmit}
    >
      <Textarea
        value={input}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        minRows={0}
        maxRows={8}
        className="bg-transparent border-none focus-visible:ring-0 p-0"
        placeholder="Anything you need..."
      />
      <div className="flex items-end justify-between">
        <Popover>
          <PopoverTrigger className="cursor-pointer">
            <ChatProgress percent={stats.percent} />
          </PopoverTrigger>
          <PopoverContent side="top" align="start">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm">Current topic</p>
                <p className="text-sm rounded-sm bg-primary/10 px-2.5 py-1.5">
                  {stats.currentModule}
                </p>
              </div>
              <Separator />
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm">Passed stages</span>
                  <div className="flex items-center gap-1">
                    <span>{stats.completedSteps}</span>
                    <span className="text-xs text-foreground/50">of</span>
                    <span>{stats.totalSteps}</span>
                  </div>
                </div>
                <Progress value={stats.completedSteps} max={stats.totalSteps} />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          type="submit"
          size="icon-lg"
          disabled={input.trim().length === 0}
          className={clsx('ml-auto transition-all duration-300 rounded-4xl')}
        >
          <HugeiconsIcon icon={ArrowUp02Icon} />
        </Button>
      </div>
    </form>
  )
}
