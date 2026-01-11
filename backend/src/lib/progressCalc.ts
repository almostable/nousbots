import { CompletedMap } from '../shared/type'

type Curriculum = {
  modules: {
    steps: any[]
  }[]
}

export const calculateProgressStats = (
  curriculum: Curriculum,
  completedMap: CompletedMap
) => {
  // 1. Считаем общее количество шагов во всем курсе
  const totalSteps = curriculum.modules.reduce((acc, module) => {
    return acc + module.steps.length
  }, 0)

  // 2. Считаем количество завершенных шагов
  // completedMap выглядит как { "0": [0, 1], "1": [0] }
  // Нам нужно просто посчитать общее количество чисел во всех массивах
  const completedSteps = Object.values(completedMap).reduce((acc, steps) => {
    return acc + steps.length
  }, 0)

  // 3. Считаем процент (защита от деления на 0)
  const percent =
    totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100)

  return {
    totalSteps,
    completedSteps,
    percent,
  }
}
