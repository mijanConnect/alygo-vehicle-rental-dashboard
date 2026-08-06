import { baseApi } from '@/redux/baseApi'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: LiveTripMeta
}

export interface LiveTripMeta {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface LiveTripPerson {
  _id?: string
  name: string
}

export interface LiveTrip {
  _id: string
  status: string
  createdAt: string
  passenger: LiveTripPerson
  driver: LiveTripPerson
  category: string
  pickup: string
  dropoff: string
  city: string
  fare: number
}

export interface LiveTripListResult {
  data: LiveTrip[]
  meta: LiveTripMeta
}

export interface GetLiveTripsParams {
  page?: number
  limit?: number
  searchTerm?: string
}

export const liveTripApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLiveTrips: builder.query<LiveTripListResult, GetLiveTripsParams | void>({
      query: (params) => {
        const page = params?.page ?? 1
        const limit = params?.limit ?? 10
        const searchTerm = params?.searchTerm?.trim()

        return {
          url: '/live-trips',
          method: 'GET',
          params: {
            page,
            limit,
            ...(searchTerm ? { searchTerm } : {}),
          },
        }
      },
      transformResponse: (response: ApiResponse<LiveTrip[]>) => ({
        data: response.data ?? [],
        meta: response.meta ?? {
          page: 1,
          limit: 10,
          totalItems: response.data?.length ?? 0,
          totalPages: 1,
        },
      }),
      providesTags: ['LiveTrip'],
    }),
  }),
})

export const { useGetLiveTripsQuery } = liveTripApi
