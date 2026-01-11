import { useState } from 'react'

export function useFormField<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  const [error, setError] = useState<string | null>(null)

  const onChange = (newValue: T) => {
    setValue(newValue)
    if (error) setError(null) // Сбрасываем ошибку при изменении
  }

  return { value, onChange, error, setError }
}
