import z from 'zod'

const StepSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('theory'),
    content: z
      .string()
      .describe(
        'Detailed theoretical material for the lesson in Markdown format.'
      ),
  }),
  z.object({
    type: z.literal('quiz'),
    question: z.string().describe('Question text'),
    options: z.array(z.string()).min(2).describe('Answer options (2-4 items)'),
    correctAnswer: z
      .string()
      .describe('Correct answer (must match one of the options exactly)'),
    explanation: z
      .string()
      .describe('Explanation of why this answer is correct'),
  }),
  z.object({
    type: z.literal('open_question'),
    question: z.string(),
    validationCriteria: z
      .string()
      .describe(
        'Criteria for AI: what to consider a correct answer from a student'
      ),
  }),
])

const ModuleSchema = z.object({
  title: z.string().describe('Module name'),
  steps: z
    .array(StepSchema)
    .describe(
      'An array of lesson steps. NOT strings, but objects with the type theory/quiz/open_question'
    ),
})

export const CurriculumSchema = z.object({
  modules: z.array(ModuleSchema),
})

export const BotGenerationSchema = z.object({
  name: z.string().describe('Creative bot name'),
  description: z.string().describe('Brief description'),
  persona: z.string().describe('System prompt (role)'),
  welcomeMessage: z.string().describe('First and welcome message to the user'),
  curriculum: CurriculumSchema.describe(
    'Complete course structure with modules and steps'
  ),
})

// used in db
export type Curriculum = z.infer<typeof CurriculumSchema>

// shared
export type StepSchema = z.infer<typeof StepSchema>
export type BotGeneration = z.infer<typeof BotGenerationSchema>
