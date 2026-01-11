'use client'

import { useState } from 'react'
import {
  useAuthenticateUser,
  useChallengeUser,
  useIdentifyUser,
} from '../hook/use-auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CircleX } from 'lucide-react'
import { GenderSwitch } from './gender-switch'
import { Spinner } from '@/components/ui/spinner'
import { useRouter } from 'next/navigation'
import {
  AuthenticateUserSchema,
  ChallengeUserSchema,
  IdentifyUserSchema,
} from '@backend/unit/auth/contract'
import Link from 'next/link'
import clsx from 'clsx'

type StepType = 'email' | 'personal' | 'code'

export function AuthPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | undefined>('male')
  const [username, setUsername] = useState<string | undefined>('')
  const [code, setCode] = useState('')

  const [step, setStep] = useState<StepType>('email')
  const [error, setError] = useState('')

  const { mutateAsync: identifyUser, isPending: isIdentifyPending } =
    useIdentifyUser()
  const { mutateAsync: challengeUser, isPending: isChallengePending } =
    useChallengeUser()
  const { mutateAsync: authenticateUser, isPending: isAuthenticatePending } =
    useAuthenticateUser()

  const handleStep = async () => {
    switch (step) {
      case 'email': {
        const result = IdentifyUserSchema.safeParse({ email: email })
        if (!result.success) return setError(result.error.issues[0].message)

        const data = await identifyUser({ email: email })

        if (data.ok) {
          const data = await challengeUser({ email: email })
          if (data.ok) return setStep('code')
        } else {
          return setStep('personal')
        }

        break
      }
      case 'personal': {
        if (!gender) return setError('Please select a gender')

        let payload
        if (!username) {
          payload = {
            email: email,
            gender: gender,
          }
        } else {
          payload = {
            email: email,
            gender: gender,
            username: username,
          }
        }

        const result = ChallengeUserSchema.safeParse(payload)

        if (!result.success) return setError(result.error.issues[0].message)

        const data = await challengeUser(payload)

        if (data.ok) {
          return setStep('code')
        } else {
          setError(data.reason)
        }

        break
      }
      case 'code':
        {
          const result = AuthenticateUserSchema.safeParse({
            email: email,
            code: code,
          })

          if (!result.success) return setError(result.error.issues[0].message)

          const data = await authenticateUser({
            email: email,
            code: code,
          })
          if (data.ok && 'id' in data) {
            router.push('/app')
            return console.log(`Alhamdulillah! ${data.id}`)
          } else {
            setError('Invalid or expired code')
          }
        }

        break
    }
  }

  return (
    <div className="flex flex-col gap-10 sm:gap-8 w-full h-full items-center justify-center px-5">
      <div className="flex flex-col items-center gap-4 sm:gap-5">
        <h1 className="font-satoshi font-medium text-center tracking-[-0.0200em] text-balance text-[28px] leading-8 sm:leading-8">
          Learn through dialogue.
          <br />
          AI-powered courses, built for you.
        </h1>
      </div>
      <div className="flex flex-col gap-5 p-8 bg-card w-full min-w-0 max-w-101 rounded-4xl">
        <div
          className={clsx(
            'flex-col justify-center text-center',
            step === 'email' ? 'hidden' : 'flex'
          )}
        >
          {step === 'personal' && (
            <div className="flex flex-col gap-1">
              <span className="font-medium text-lg">
                Tell us about yourself
              </span>
            </div>
          )}

          {step === 'code' && (
            <div className="flex flex-col gap-3">
              <div className="font-normal text-lg leading-6">
                <span className="text-foreground/50">
                  Enter the code sent to
                </span>
                <br />
                <span className="block max-w-full truncate">
                  {email || 'noname@who.is'}
                </span>
              </div>
            </div>
          )}
        </div>
        {step === 'email' && (
          <div className="flex flex-col gap-5">
            <Input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError('')
              }}
              placeholder="Your email"
              className={error ? 'border-red-400' : ''}
            />
            <Button
              onClick={handleStep}
              disabled={isIdentifyPending}
              className="w-full"
              size="lg"
            >
              {isIdentifyPending ? <Spinner /> : 'Continue'}
            </Button>
            {error && (
              <div className="flex justify-center items-center gap-1.5 text-red-400 text-sm">
                <CircleX size={12} />
                {error}
              </div>
            )}
            <div className="text-xs text-center text-foreground/50">
              By continuing, you agree to Puur&apos;s{' '}
              <Link
                href="/privacy"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        )}
        {step === 'personal' && (
          <div className="flex flex-col gap-5">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className={error ? 'border-rose-500' : ''}
            />
            <GenderSwitch value={gender} onChange={setGender} />

            <Button
              onClick={handleStep}
              disabled={isChallengePending}
              className="w-full"
              size="lg"
            >
              Continue
            </Button>
            {error && <span className="text-red-400">{error}</span>}
          </div>
        )}
        {step === 'code' && (
          <div className="flex flex-col justify-center items-center gap-5">
            <Input
              value={code}
              onChange={(e) => {
                const newValue = e.target.value
                setCode(newValue)
                if (error) setError('')
              }}
              placeholder="Code"
              className={error ? 'border-red-400' : ''}
              autoFocus
            />
            <Button
              onClick={handleStep}
              disabled={isAuthenticatePending}
              className="w-full"
              size="lg"
            >
              {isAuthenticatePending ? <Spinner /> : 'Confirm'}
            </Button>
            {error && (
              <div className="flex justify-center items-center gap-1.5 text-red-400 text-sm">
                <CircleX size={12} />
                {error}
              </div>
            )}
            <div className="text-sm">
              <span className="text-foreground/50">No email received?</span>{' '}
              <button className="hover:underline underline-offset-2 cursor-pointer">
                Send it again.
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
