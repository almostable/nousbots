import z from 'zod'

export const IdentifyUserSchema = z.object({
  email: z.email().nonempty(),
})

export const ChallengeUserSchema = z.object({
  email: z.email().nonempty(),
  gender: z.enum(['male', 'female']).optional(),
  username: z.string().trim().min(3).max(18).optional(),
})

export const AuthenticateUserSchema = z.object({
  email: z.email().nonempty(),
  code: z
    .string({ error: 'Incorrect code, try again' })
    .length(5, { error: 'Incorrect code, try again' }),
})

export type IdentifyUserDTO = z.infer<typeof IdentifyUserSchema>
export type ChallengeUserDTO = z.infer<typeof ChallengeUserSchema>
export type AuthenticateUserDTO = z.infer<typeof AuthenticateUserSchema>
