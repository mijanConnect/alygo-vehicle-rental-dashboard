import { baseApi } from '@/redux/baseApi'
import { cleanObject } from '@/utils/cleanObject'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPage: number
}

interface PaginatedApiResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta?: PaginationMeta
}

export interface PassengerListItem {
  passengerId: string
  fullName: string
  avatar?: string
  email: string
  averageRating: number
  totalTrips: number
  walletBalance: number
  city: string
  accountStatus: string
  phone?: string
}

export interface PassengerBasicInformation {
  passengerId: string
  fullName: string
  avatar?: string
  email: string
  phone: string
  gender?: string | null
  dateOfBirth?: string | null
}

export interface PassengerAccountInfo {
  accountStatus: string
  createdAt: string
  lastLogin: string | null
  verificationStatus: string
}

export interface PassengerRideStatistics {
  totalTrips: number
  completedTrips: number
  cancelledTrips: number
  totalDistance: number
  totalSpent: number
  averageRating: number
}

export interface PassengerWalletInfo {
  currentBalance: number
  totalDeposits: number
  totalSpent: number
  totalRefunds: number
}

export interface PassengerDetailsData {
  basicInformation: PassengerBasicInformation
  account: PassengerAccountInfo
  rideStatistics: PassengerRideStatistics
  wallet: PassengerWalletInfo
  recentTrips: unknown[]
  recentReviews: unknown[]
}

export interface LivePassengerItem {
  passengerId?: string
  _id?: string
  fullName?: string
  name?: string
  avatar?: string
  email?: string
  phone?: string
  averageRating?: number
  totalTrips?: number
  walletBalance?: number
  city?: string
  accountStatus?: string
  status?: string
  location?: {
    address?: string
  }
  [key: string]: unknown
}

export interface PassengerQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: string
}

export interface PassengerListResult<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

function mapMeta(meta: PaginationMeta | undefined, count: number) {
  return {
    page: meta?.page ?? 1,
    limit: meta?.limit ?? 10,
    totalItems: meta?.total ?? count,
    totalPages: meta?.totalPage ?? 1,
  }
}

export const passengersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPassengersList: builder.query<
      PassengerListResult<PassengerListItem>,
      PassengerQueryParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/passenger-management',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<PassengerListItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: ['Passengers'],
    }),

    getSinglePassenger: builder.query<PassengerDetailsData, string>({
      query: (id) => ({
        url: `/passenger-management/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<PassengerDetailsData>) =>
        response.data,
      providesTags: (_res, _err, id) => [{ type: 'Passengers', id }],
    }),

    getAllLiveActivityPassengers: builder.query<
      PassengerListResult<LivePassengerItem>,
      PassengerQueryParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm } = {}) => ({
        url: '/passenger-management/live-activity',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<LivePassengerItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: ['Passengers'],
    }),

    getSingleLiveActivityPassenger: builder.query<LivePassengerItem, string>({
      query: (id) => ({
        url: `/passenger-management/live-activity/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<LivePassengerItem>) =>
        response.data,
      providesTags: (_res, _err, id) => [{ type: 'Passengers', id }],
    }),

    getAllSuspendedPassengers: builder.query<
      PassengerListResult<PassengerListItem>,
      PassengerQueryParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm } = {}) => ({
        url: '/passenger-management/suspended',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<PassengerListItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: ['Passengers'],
    }),
  }),
})

export const {
  useGetPassengersListQuery,
  useGetSinglePassengerQuery,
  useGetAllLiveActivityPassengersQuery,
  useGetSingleLiveActivityPassengerQuery,
  useGetAllSuspendedPassengersQuery,
} = passengersApi
