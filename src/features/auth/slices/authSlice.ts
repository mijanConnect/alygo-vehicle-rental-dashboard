import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { authApi } from '@/features/auth/services/authApi'
import type { AuthFlowState } from '@/features/auth/types'
import type { ActivityItem, AuthUser, KpiMetric } from '@/types'
import { STORAGE_KEYS } from '@/constants'

const storedUser = localStorage.getItem(STORAGE_KEYS.user)
const storedToken = localStorage.getItem(STORAGE_KEYS.token)

const initialFlowState: AuthFlowState = {
  login: { status: 'idle', error: null },
  forgotPassword: {
    email: null,
    status: 'idle',
    error: null,
    successMessage: null,
    expiresIn: 60,
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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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
        state.flow.login.error =
          (action.payload as { data?: string })?.data ?? 'Unable to sign in. Please try again.'
      })
      .addMatcher(authApi.endpoints.forgotPassword.matchPending, (state) => {
        state.flow.forgotPassword.status = 'loading'
        state.flow.forgotPassword.error = null
      })
      .addMatcher(authApi.endpoints.forgotPassword.matchFulfilled, (state, action) => {
        const email = action.meta.arg.originalArgs.email
        state.flow.forgotPassword.email = email
        state.flow.forgotPassword.status = 'success'
        state.flow.forgotPassword.successMessage = action.payload.message
        state.flow.forgotPassword.expiresIn = action.payload.expiresIn
        state.flow.forgotPassword.otpSentAt = Date.now()
        state.flow.otpVerification.email = email
        state.flow.otpVerification.otpSentAt = Date.now()
      })
      .addMatcher(authApi.endpoints.forgotPassword.matchRejected, (state, action) => {
        state.flow.forgotPassword.status = 'error'
        state.flow.forgotPassword.error =
          (action.payload as { data?: string })?.data ?? 'Unable to send verification code.'
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
        const payload = action.payload as { data?: { message?: string; type?: 'invalid' | 'expired' } }
        state.flow.otpVerification.error = payload?.data?.message ?? 'Verification failed.'
        state.flow.otpVerification.errorType = payload?.data?.type ?? 'invalid'
      })
      .addMatcher(authApi.endpoints.resendOtp.matchPending, (state) => {
        state.flow.otpVerification.status = 'loading'
      })
      .addMatcher(authApi.endpoints.resendOtp.matchFulfilled, (state, action) => {
        state.flow.otpVerification.status = 'idle'
        state.flow.otpVerification.error = null
        state.flow.otpVerification.errorType = null
        state.flow.forgotPassword.expiresIn = action.payload.expiresIn
        state.flow.forgotPassword.otpSentAt = Date.now()
        state.flow.otpVerification.otpSentAt = Date.now()
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
        state.flow.resetPassword.error =
          (action.payload as { data?: string })?.data ?? 'Unable to update password.'
      })
  },
})

export const {
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
