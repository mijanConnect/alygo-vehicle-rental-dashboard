import type { AuthUser } from '@/types'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
  expiresIn: number
}

export interface VerifyOtpRequest {
  email: string
  oneTimeCode: number
}

export interface VerifyOtpResponse {
  resetToken: string
  message: string
}

export interface ResendOtpRequest {
  email: string
}

export interface ResendOtpResponse {
  message: string
  expiresIn?: number
}

export interface ResetPasswordRequest {
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordResponse {
  success?: boolean
  message: string
}

export type AuthFlowStatus = 'idle' | 'loading' | 'success' | 'error'

export type OtpErrorType = 'invalid' | 'expired' | null

export interface AuthFlowState {
  login: {
    status: AuthFlowStatus
    error: string | null
  }
  forgotPassword: {
    email: string | null
    status: AuthFlowStatus
    error: string | null
    successMessage: string | null
    expiresIn: number
    otpSentAt: number | null
  }
  otpVerification: {
    email: string | null
    status: AuthFlowStatus
    error: string | null
    errorType: OtpErrorType
    resetToken: string | null
    otpSentAt: number | null
  }
  resetPassword: {
    status: AuthFlowStatus
    error: string | null
    successMessage: string | null
  }
}

export interface PasswordRule {
  key: string
  label: string
  test: (password: string) => boolean
}
