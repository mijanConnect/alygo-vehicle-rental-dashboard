import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '@/features/auth/types'
import {
  clearOtpSession,
  createOtpSession,
  delay,
  getOtpSession,
  validateResetToken,
  verifyOtpSession,
} from '@/features/auth/services/otpStore'
import { isPasswordStrong, OTP_EXPIRY_SECONDS } from '@/features/auth/utils/passwordRules'
import { DEMO_CREDENTIALS } from '@/constants'
import { mockAdminUser } from '@/services/mock/data'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      queryFn: async ({ email, password }) => {
        await delay()
        if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
          return { data: { token: 'demo-jwt-token', user: mockAdminUser } }
        }
        return { error: { status: 401, data: 'Invalid email or password. Please try again.' } }
      },
      invalidatesTags: ['Auth'],
    }),
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      queryFn: async ({ email }) => {
        await delay(600)
        if (!email.includes('@')) {
          return { error: { status: 400, data: 'Enter a valid administrator email address.' } }
        }
        createOtpSession(email)
        return {
          data: {
            message: 'Verification code sent to your email address.',
            expiresIn: OTP_EXPIRY_SECONDS,
          },
        }
      },
    }),
    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      queryFn: async ({ email, otp }) => {
        await delay(600)
        const session = getOtpSession(email)
        if (!session) {
          return { error: { status: 400, data: { message: 'Invalid verification code.', type: 'invalid' } } }
        }
        const result = verifyOtpSession(email, otp)
        if (!result.ok) {
          return {
            error: {
              status: 400,
              data: {
                message: result.reason === 'expired' ? 'Verification code has expired.' : 'Invalid verification code.',
                type: result.reason,
              },
            },
          }
        }
        return {
          data: {
            resetToken: result.resetToken,
            message: 'Identity verified successfully.',
          },
        }
      },
    }),
    resendOtp: builder.mutation<ResendOtpResponse, ResendOtpRequest>({
      queryFn: async ({ email }) => {
        await delay(500)
        if (!getOtpSession(email)) {
          return { error: { status: 400, data: 'No active verification session. Request a new code.' } }
        }
        createOtpSession(email)
        return {
          data: {
            message: 'A new verification code has been sent.',
            expiresIn: OTP_EXPIRY_SECONDS,
          },
        }
      },
    }),
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      queryFn: async ({ email, resetToken, password, confirmPassword }) => {
        await delay(700)
        if (!validateResetToken(email, resetToken)) {
          return { error: { status: 400, data: 'Invalid or expired reset session. Please start again.' } }
        }
        if (password !== confirmPassword) {
          return { error: { status: 400, data: 'Passwords do not match.' } }
        }
        if (!isPasswordStrong(password)) {
          return { error: { status: 400, data: 'Password does not meet security requirements.' } }
        }
        clearOtpSession(email)
        return { data: { message: 'Password updated successfully.' } }
      },
    }),
  }),
})

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useResetPasswordMutation,
} = authApi
