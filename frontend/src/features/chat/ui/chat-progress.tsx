import { Tick01Icon, Tick03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'

interface CircularProgressProps {
  percent: number
  size?: number
  strokeWidth?: number
}

export const ChatProgress = ({
  percent,
  size = 32,
  strokeWidth = 2,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className={clsx('relative flex items-center justify-center')}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-stone-700"
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-stone-200 transition-all duration-1000 ease-out"
        />
      </svg>

      <div className="absolute text-[9px] font-bold text-foreground">
        {percent === 100 ? (
          <HugeiconsIcon size={16} icon={Tick01Icon} strokeWidth={3} />
        ) : (
          `${percent}%`
        )}
      </div>
    </div>
  )
}
