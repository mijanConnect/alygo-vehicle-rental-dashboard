import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/store'

export const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api/v1',
  prepareHeaders: (headers, { getState }) => {
    // Attempt to get the token from the Redux store
    const token = (getState() as RootState).auth?.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})
