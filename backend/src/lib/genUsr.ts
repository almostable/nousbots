import { customAlphabet } from 'nanoid'

const adjectives = [
  'pure',
  'noble',
  'swift',
  'amana',
  'wise',
  'brave',
  'calm',
  'sabr',
  'bright',
  'keen',
  'steady',
  'honest',
  'sadiq',
  'smart',
  'clear',
]

const generateNumbers = customAlphabet('0123456789', 9)

export function generateUsername(): string {
  const randomIndices = new Uint32Array(1)
  crypto.getRandomValues(randomIndices)
  const adj = adjectives[randomIndices[0] % adjectives.length]

  const suffix = generateNumbers()

  return `${adj}${suffix}`
}

// console.log(generateUsername())
