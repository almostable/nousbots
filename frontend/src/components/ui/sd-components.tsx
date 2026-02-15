import { motion, Transition } from 'framer-motion'
import { ComponentPropsWithoutRef, ReactNode } from 'react'
import type { Components } from 'react-markdown'

// 1. Типизируем переход через кортеж (tuple) из 4 чисел для cubic-bezier
const easeCustom: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

const springTransition: Transition = {
  duration: 0.5,
  ease: easeCustom,
}

const fadeDown = {
  initial: { opacity: 0, y: -10, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

/**
 * 2. Безопасный фильтр пропсов без 'any'.
 * Мы используем Record<string, unknown>, что является безопасной альтернативой any.
 */
function filterMotionProps<T extends Record<string, unknown>>(props: T) {
  // Деструктурируем конфликтующие свойства, остальные собираем в rest
  const {
    onAnimationStart,
    onAnimationEnd,
    onDrag,
    onDragStart,
    onDragEnd,
    node, // react-markdown часто прокидывает объект node, который не нужен в DOM
    ...rest
  } = props

  return rest
}

export const streamdownComponents: Components = {
  // Параграфы
  p: ({ children, ...props }: ComponentPropsWithoutRef<'p'>) => (
    <motion.p
      {...fadeDown}
      transition={springTransition}
      {...filterMotionProps(props as Record<string, unknown>)}
      style={{ marginBottom: '1.25rem', ...props.style }}
    >
      {children}
    </motion.p>
  ),

  // Заголовки
  h1: ({ children, ...props }: ComponentPropsWithoutRef<'h1'>) => (
    <motion.h1
      {...fadeDown}
      transition={{ ...springTransition, duration: 0.6 }}
      className="text-2xl font-bold mb-4"
      {...filterMotionProps(props as Record<string, unknown>)}
    >
      {children}
    </motion.h1>
  ),

  // Списки
  li: ({ children, ...props }: ComponentPropsWithoutRef<'li'>) => (
    <motion.li
      initial={{ opacity: 0, x: -10, filter: 'blur(5px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.3 }}
      className="mb-1"
      {...filterMotionProps(props as Record<string, unknown>)}
    >
      {children}
    </motion.li>
  ),

  // Блоки кода
  code: ({
    children,
    className,
    ...props
  }: ComponentPropsWithoutRef<'code'>) => {
    // В новых версиях react-markdown inline определяется по отсутствию класса
    const isInline = !className

    if (isInline) {
      return (
        <code
          className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm"
          {...filterMotionProps(props as Record<string, unknown>)}
        >
          {children}
        </code>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98, filter: 'blur(12px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={springTransition}
        className="my-4 overflow-hidden rounded-lg"
      >
        <code
          className={className}
          {...filterMotionProps(props as Record<string, unknown>)}
        >
          {children}
        </code>
      </motion.div>
    )
  },
}
