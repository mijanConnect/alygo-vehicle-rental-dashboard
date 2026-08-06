import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RESET_PASSWORD_TOKEN_KEY } from '@/constants/auth-storage'
import type { RootState } from '@/redux/store'

/** @deprecated Prefer importing `baseApi` from `@/redux/baseApi` */
export const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api/v1',
  prepareHeaders: (headers, { getState, endpoint }) => {
    const authToken = (getState() as RootState).auth?.token
    const resetToken =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem(RESET_PASSWORD_TOKEN_KEY)
        : null
    const token =
      endpoint === 'resetPassword' && resetToken ? resetToken : authToken
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})
