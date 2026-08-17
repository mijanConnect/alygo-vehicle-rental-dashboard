import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { authApi } from '@/redux/api/authApi'
import type { AuthFlowState } from '@/features/auth/types'
import type { ActivityItem, AuthUser, KpiMetric } from '@/types'
import { STORAGE_KEYS } from '@/constants'
import { OTP_EXPIRY_SECONDS } from '@/features/auth/utils/passwordRules'

const storedUser = localStorage.getItem(STORAGE_KEYS.user)
const storedToken = localStorage.getItem(STORAGE_KEYS.token)

const initialFlowState: AuthFlowState = {
  login: { status: 'idle', error: null },
  forgotPassword: {
    email: null,
    status: 'idle',
    error: null,
    successMessage: null,
    expiresIn: OTP_EXPIRY_SECONDS,
    otpSentAt: null,
  },
  otpVerification: {
    email: null,
    status: 'idle',
    error: null,
    errorType: null,
    resetToken: null,
    otpSentAt: null,
  },
  resetPassword: {
    status: 'idle',
    error: null,
    successMessage: null,
  },
}

interface AuthSliceState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  liveActivities: ActivityItem[]
  liveKpis: Record<string, number>
  flow: AuthFlowState
}

const initialState: AuthSliceState = {
  user: storedUser ? (JSON.parse(storedUser) as AuthUser) : null,
  token: storedToken,
  isAuthenticated: Boolean(storedToken),
  liveActivities: [],
  liveKpis: {},
  flow: initialFlowState,
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === 'string') return payload
  if (payload && typeof payload === 'object') {
    const data = payload as { data?: unknown; message?: string }
    if (typeof data.data === 'string') return data.data
    if (data.data && typeof data.data === 'object') {
      const nested = data.data as { message?: string }
      if (nested.message) return nested.message
    }
    if (typeof data.message === 'string') return data.message
  }
  return fallback
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload
      state.isAuthenticated = Boolean(action.payload)
      if (action.payload) {
        localStorage.setItem(STORAGE_KEYS.token, action.payload)
      } else {
        localStorage.removeItem(STORAGE_KEYS.token)
      }
    },
    clearToken: (state) => {
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem(STORAGE_KEYS.token)
    },
    setCredentials: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.flow.login = { status: 'success', error: null }
      localStorage.setItem(STORAGE_KEYS.token, action.payload.token)
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(action.payload.user))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.flow = initialFlowState
      localStorage.removeItem(STORAGE_KEYS.token)
      localStorage.removeItem(STORAGE_KEYS.user)
    },
    addLiveActivity: (state, action: PayloadAction<ActivityItem>) => {
      state.liveActivities = [action.payload, ...state.liveActivities].slice(0, 50)
    },
    updateLiveKpis: (state, action: PayloadAction<KpiMetric[]>) => {
      action.payload.forEach((kpi) => {
        state.liveKpis[kpi.key] = kpi.value
      })
    },
    clearLoginError: (state) => {
      state.flow.login.error = null
    },
    setForgotPasswordEmail: (state, action: PayloadAction<string>) => {
      state.flow.forgotPassword.email = action.payload
      state.flow.otpVerification.email = action.payload
    },
    clearAuthFlow: (state) => {
      state.flow = initialFlowState
    },
    resetOtpTimer: (state, action: PayloadAction<number>) => {
      const now = Date.now()
      state.flow.forgotPassword.otpSentAt = now
      state.flow.otpVerification.otpSentAt = now
      state.flow.forgotPassword.expiresIn = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.flow.login.status = 'loading'
        state.flow.login.error = null
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state) => {
        state.flow.login.status = 'success'
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        state.flow.login.status = 'error'
        state.flow.login.error = getErrorMessage(
          action.payload,
          'Unable to sign in. Please try again.',
        )
      })
      .addMatcher(authApi.endpoints.forgotPassword.matchPending, (state) => {
        state.flow.forgotPassword.status = 'loading'
        state.flow.forgotPassword.error = null
      })
      .addMatcher(authApi.endpoints.forgotPassword.matchFulfilled, (state, action) => {
        const email = action.meta.arg.originalArgs.email
        const now = Date.now()
        state.flow.forgotPassword.email = email
        state.flow.forgotPassword.status = 'success'
        state.flow.forgotPassword.successMessage = action.payload.message
        state.flow.forgotPassword.expiresIn = OTP_EXPIRY_SECONDS
        state.flow.forgotPassword.otpSentAt = now
        state.flow.otpVerification.email = email
        state.flow.otpVerification.otpSentAt = now
      })
      .addMatcher(authApi.endpoints.forgotPassword.matchRejected, (state, action) => {
        state.flow.forgotPassword.status = 'error'
        state.flow.forgotPassword.error = getErrorMessage(
          action.payload,
          'Unable to send verification code.',
        )
      })
      .addMatcher(authApi.endpoints.verifyOtp.matchPending, (state) => {
        state.flow.otpVerification.status = 'loading'
        state.flow.otpVerification.error = null
        state.flow.otpVerification.errorType = null
      })
      .addMatcher(authApi.endpoints.verifyOtp.matchFulfilled, (state, action) => {
        state.flow.otpVerification.status = 'success'
        state.flow.otpVerification.resetToken = action.payload.resetToken
      })
      .addMatcher(authApi.endpoints.verifyOtp.matchRejected, (state, action) => {
        state.flow.otpVerification.status = 'error'
        state.flow.otpVerification.error = getErrorMessage(
          action.payload,
          'Verification failed.',
        )
        state.flow.otpVerification.errorType = 'invalid'
      })
      .addMatcher(authApi.endpoints.resendOtp.matchPending, (state) => {
        state.flow.otpVerification.status = 'loading'
      })
      .addMatcher(authApi.endpoints.resendOtp.matchFulfilled, (state) => {
        const now = Date.now()
        state.flow.otpVerification.status = 'idle'
        state.flow.otpVerification.error = null
        state.flow.otpVerification.errorType = null
        state.flow.forgotPassword.expiresIn = OTP_EXPIRY_SECONDS
        state.flow.forgotPassword.otpSentAt = now
        state.flow.otpVerification.otpSentAt = now
      })
      .addMatcher(authApi.endpoints.resetPassword.matchPending, (state) => {
        state.flow.resetPassword.status = 'loading'
        state.flow.resetPassword.error = null
      })
      .addMatcher(authApi.endpoints.resetPassword.matchFulfilled, (state, action) => {
        state.flow.resetPassword.status = 'success'
        state.flow.resetPassword.successMessage = action.payload.message
      })
      .addMatcher(authApi.endpoints.resetPassword.matchRejected, (state, action) => {
        state.flow.resetPassword.status = 'error'
        state.flow.resetPassword.error = getErrorMessage(
          action.payload,
          'Unable to update password.',
        )
      })
      .addMatcher(authApi.endpoints.getProfile.matchFulfilled, (state, action) => {
        const profile = action.payload
        const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
        const origin = baseUrl.replace(/\/api\/v1\/?$/, '')
        const avatar = profile.profileImage
          ? profile.profileImage.startsWith('http')
            ? profile.profileImage
            : `${origin}${profile.profileImage}`
          : state.user?.avatar

        state.user = {
          id: profile._id || state.user?.id || '',
          email: profile.email || state.user?.email || '',
          name: profile.name || state.user?.name || '',
          role: (profile.role as AuthUser['role']) || state.user?.role || 'superAdmin',
          permissions: state.user?.permissions ?? [],
          avatar,
        }
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(state.user))
      })
      .addMatcher(authApi.endpoints.updateProfile.matchFulfilled, (state, action) => {
        const profile = action.payload.data
        if (!profile) return
        const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
        const origin = baseUrl.replace(/\/api\/v1\/?$/, '')
        const avatar = profile.profileImage
          ? profile.profileImage.startsWith('http')
            ? profile.profileImage
            : `${origin}${profile.profileImage}`
          : state.user?.avatar

        state.user = {
          id: profile._id || state.user?.id || '',
          email: profile.email || state.user?.email || '',
          name: profile.name || state.user?.name || '',
          role: (profile.role as AuthUser['role']) || state.user?.role || 'superAdmin',
          permissions: state.user?.permissions ?? [],
          avatar,
        }
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(state.user))
      })
  },
})

export const {
  setToken,
  clearToken,
  setCredentials,
  logout,
  addLiveActivity,
  updateLiveKpis,
  clearLoginError,
  setForgotPasswordEmail,
  clearAuthFlow,
  resetOtpTimer,
} = authSlice.actions

export default authSlice.reducer
