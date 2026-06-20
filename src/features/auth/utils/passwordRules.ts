import type { PasswordRule } from '@/features/auth/types'

export const DEMO_OTP = '123456'
export const OTP_EXPIRY_SECONDS = 60

export const passwordRules: PasswordRule[] = [
  { key: 'length', label: 'Minimum 8 Characters', test: (p) => p.length >= 8 },
  { key: 'upper', label: 'One Uppercase Letter', test: (p) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'One Lowercase Letter', test: (p) => /[a-z]/.test(p) },
  { key: 'number', label: 'One Number', test: (p) => /\d/.test(p) },
  { key: 'special', label: 'One Special Character', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

export function isPasswordStrong(password: string) {
  return passwordRules.every((rule) => rule.test(password))
}

export function getPasswordStrength(password: string) {
  const passed = passwordRules.filter((rule) => rule.test(password)).length
  if (passed <= 2) return { label: 'Weak', percent: 25, color: '#EF4444' }
  if (passed <= 3) return { label: 'Fair', percent: 50, color: '#F59E0B' }
  if (passed <= 4) return { label: 'Good', percent: 75, color: '#F97316' }
  return { label: 'Strong', percent: 100, color: '#22C55E' }
}
