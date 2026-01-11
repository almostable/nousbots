import { StepSchema } from '../shared/contract'

export function getStepContent(step: StepSchema) {
  switch (step.type) {
    case 'theory':
      return step.content

    case 'quiz':
      return `Question: ${step.question}. Options: ${step.options}. Correct answer: ${step.correctAnswer}. Explanation: ${step.explanation}.`

    case 'open_question':
      return `Question: ${step.question}. Validation criteria: ${step.validationCriteria}.`
  }
}
