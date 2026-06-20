import { DEMO_OTP, OTP_EXPIRY_SECONDS } from '@/features/auth/utils/passwordRules'

interface OtpSession {
  otp: string
  expiresAt: number
  resetToken: string | null
}

const sessions = new Map<string, OtpSession>()

export function createOtpSession(email: string) {
  const normalized = email.toLowerCase().trim()
  const session: OtpSession = {
    otp: DEMO_OTP,
    expiresAt: Date.now() + OTP_EXPIRY_SECONDS * 1000,
    resetToken: null,
  }
  sessions.set(normalized, session)
  return session
}

export function getOtpSession(email: string) {
  return sessions.get(email.toLowerCase().trim())
}

export function verifyOtpSession(email: string, otp: string) {
  const session = getOtpSession(email)
  if (!session) return { ok: false as const, reason: 'invalid' as const }
  if (Date.now() > session.expiresAt) return { ok: false as const, reason: 'expired' as const }
  if (session.otp !== otp) return { ok: false as const, reason: 'invalid' as const }

  const resetToken = crypto.randomUUID()
  session.resetToken = resetToken
  sessions.set(email.toLowerCase().trim(), session)
  return { ok: true as const, resetToken }
}

export function validateResetToken(email: string, resetToken: string) {
  const session = getOtpSession(email)
  return session?.resetToken === resetToken
}

export function clearOtpSession(email: string) {
  sessions.delete(email.toLowerCase().trim())
}

export const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))
