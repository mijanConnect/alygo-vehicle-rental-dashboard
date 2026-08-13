import { baseApi } from '@/redux/baseApi'
import { RESET_PASSWORD_TOKEN_KEY } from '@/constants/auth-storage'
import type { AuthUser } from '@/types'
import type { LoginResponse as AppLoginResponse } from '@/features/auth/types'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface LoginRequest {
  email: string
  password: string
}

interface LoginApiData {
  accessToken?: string
  token?: string
  role?: string
  user?: Record<string, unknown> & {
    _id?: string
    id?: string
    role?: string
    permissions?: string[]
    profileImage?: string
    name?: string
    email?: string
  }
}

export interface ProfileSubscription {
  _id: string
  name: string
  modules: number[]
  is_proggramme_sell?: boolean
  minimum_programme_price?: number
  endDate?: string | null
}

export interface UserProfile {
  _id: string
  name: string
  email: string
  role: string
  profileImage?: string
  coverImage?: string
  gender?: string
  status: string
  verified: boolean
  phone?: string
  countryCode?: string
  averageRating?: number
  totalRatings?: number
  totalReviews?: number
  isStripeOnboarded?: boolean
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
  location?: {
    type?: string
    coordinates?: [number, number]
    address?: string
  }
  suspension?: {
    isSuspended?: boolean
    suspendedBy?: string | null
    suspendedAt?: string | null
    reason?: string
    note?: string
  }
}

export interface UpdateProfileRequest {
  name?: string
  email?: string
  phone?: string
  countryCode?: string
  gender?: string
  profileImage?: File
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyOtpRequest {
  email: string
  oneTimeCode: number
}

export interface VerifyOtpApiResponse {
  success: boolean
  message: string
  data: string
}

export interface ResendOtpRequest {
  email: string
}

export interface ResetPasswordRequest {
  newPassword: string
  confirmPassword: string
}

function mapLoginResponse(response: ApiResponse<LoginApiData> | LoginApiData): AppLoginResponse {
  const payload =
    response && typeof response === 'object' && 'data' in response
      ? (response as ApiResponse<LoginApiData>).data
      : (response as LoginApiData)

  const token = payload.accessToken ?? payload.token ?? ''
  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
  const origin = baseUrl.replace(/\/api\/v1\/?$/, '')
  const apiUser = payload.user

  if (apiUser) {
    const role =
      apiUser.role === 'user' || !apiUser.role ? 'superAdmin' : apiUser.role

    return {
      token,
      user: {
        ...(apiUser as unknown as AuthUser),
        id: String(apiUser._id ?? apiUser.id ?? ''),
        role: role as AuthUser['role'],
        permissions: (apiUser.permissions as AuthUser['permissions']) ?? [],
        avatar: apiUser.profileImage
          ? `${origin}${apiUser.profileImage}`
          : undefined,
        name: apiUser.name ?? '',
        email: apiUser.email ?? '',
      },
    }
  }

  const role =
    payload.role === 'user' || !payload.role ? 'superAdmin' : payload.role

  return {
    token,
    user: {
      id: 'me',
      name: '',
      email: '',
      role: role as AuthUser['role'],
      permissions: [],
    },
  }
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AppLoginResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<LoginApiData> | LoginApiData) =>
        mapLoginResponse(response),
      transformErrorResponse: (response: { status: number | string; data?: unknown }) => {
        const data = response.data as { message?: string } | string | undefined
        if (typeof data === 'string') return data
        return data?.message ?? 'Login failed. Please try again.'
      },
      invalidatesTags: ['Auth'],
    }),
    forgotPassword: builder.mutation<
      { success: boolean; message: string },
      ForgotPasswordRequest
    >({
      query: (body) => ({
        url: '/auth/forget-password',
        method: 'POST',
        body,
      }),
      transformErrorResponse: (response: { data?: unknown }) => {
        const data = response.data as { message?: string } | string | undefined
        if (typeof data === 'string') return data
        return data?.message ?? 'Unable to send verification code.'
      },
      invalidatesTags: ['Auth'],
    }),
    verifyOtp: builder.mutation<
      { resetToken: string; message: string },
      VerifyOtpRequest
    >({
      query: (body) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body,
      }),
      transformResponse: (response: VerifyOtpApiResponse) => ({
        resetToken: response.data,
        message: response.message,
      }),
      transformErrorResponse: (response: { data?: unknown }) => {
        const data = response.data as { message?: string } | string | undefined
        if (typeof data === 'string') return { message: data, type: 'invalid' as const }
        return {
          message: data?.message ?? 'Verification failed.',
          type: 'invalid' as const,
        }
      },
      invalidatesTags: ['Auth'],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data.resetToken && typeof localStorage !== 'undefined') {
            localStorage.setItem(RESET_PASSWORD_TOKEN_KEY, data.resetToken)
          }
        } catch {
          // Token is only stored after a successful verification.
        }
      },
    }),
    resendOtp: builder.mutation<
      { success: boolean; message: string },
      ResendOtpRequest
    >({
      query: (body) => ({
        url: '/auth/forget-password',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    resetPassword: builder.mutation<
      { success: boolean; message: string },
      ResetPasswordRequest
    >({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
      transformErrorResponse: (response: { data?: unknown }) => {
        const data = response.data as { message?: string } | string | undefined
        if (typeof data === 'string') return data
        return data?.message ?? 'Unable to update password.'
      },
      invalidatesTags: ['Auth'],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(RESET_PASSWORD_TOKEN_KEY)
          }
        } catch {
          // Keep token so the user can retry reset after a failed attempt.
        }
      },
    }),
    getProfile: builder.query<UserProfile, void>({
      query: () => ({
        url: '/users/profile',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<UserProfile>) => response.data,
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<
      { success: boolean; message: string; data: UserProfile },
      UpdateProfileRequest
    >({
      query: ({ profileImage, ...fields }) => {
        const formData = new FormData()
        const dataPayload = Object.fromEntries(
          Object.entries(fields).filter(([, value]) => value !== undefined && value !== ''),
        )
        formData.append('data', JSON.stringify(dataPayload))
        if (profileImage) {
          formData.append('profileImage', profileImage)
        }

        return {
          url: '/users',
          method: 'PATCH',
          body: formData,
        }
      },
      invalidatesTags: ['Profile'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            authApi.util.updateQueryData('getProfile', undefined, (draft) => {
              Object.assign(draft, data.data)
            }),
          )
        } catch {
          // Keep existing cache when update fails.
        }
      },
    }),
    changePassword: builder.mutation<
      { success: boolean; message: string },
      ChangePasswordRequest
    >({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'PATCH',
        body,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useResetPasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi
