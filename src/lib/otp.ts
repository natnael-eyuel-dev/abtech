import crypto from 'crypto'

export function generateOTP(length: number = 6): string {
  const digits = '0123456789'
  let otp = ''
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)]
  }
  return otp
}

export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

export async function hashOTP(otp: string): Promise<string> {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

export async function verifyOTP(otp: string, hashedOTP: string): Promise<boolean> {
  const hashedInput = await hashOTP(otp)
  return hashedInput === hashedOTP
}