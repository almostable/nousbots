import React from 'react'

// 1. Определяем строгий тип для значений
export type Gender = 'male' | 'female' | undefined

// 2. Интерфейс пропсов
interface GenderSwitchProps {
  value: Gender
  onChange: (value: Gender) => void
}

export const GenderSwitch: React.FC<GenderSwitchProps> = ({
  value,
  onChange,
}) => {
  // Проверка для стилизации: выбрана ли женщина?
  const isFemale = value === 'female'

  return (
    <div className="relative flex w-full max-w-full border border-foreground/20 rounded-4xl h-12">
      <div
        className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-foreground/10 rounded-4xl transition-transform duration-150 ease-in-out pointer-events-none ${
          isFemale ? 'translate-x-full' : 'translate-x-0'
        }`}
      />

      {/* Кнопка MALE */}
      <button
        type="button"
        onClick={() => onChange('male')}
        className={`relative z-10 w-1/2 text-sm font-medium transition-colors duration-100 flex items-center justify-center cursor-pointer ${
          !isFemale ? 'text-white' : 'text-neutral-500'
        }`}
      >
        Male
      </button>

      {/* Кнопка FEMALE */}
      <button
        type="button"
        onClick={() => onChange('female')}
        className={`relative z-10 w-1/2 text-sm font-medium transition-colors duration-100 flex items-center justify-center cursor-pointer ${
          isFemale ? 'text-white' : 'text-neutral-500'
        }`}
      >
        Female
      </button>
    </div>
  )
}
