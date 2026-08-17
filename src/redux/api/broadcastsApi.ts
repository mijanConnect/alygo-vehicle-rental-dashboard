import { baseApi } from '@/redux/baseApi'
import { cleanObject } from '@/utils/cleanObject'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface PaginationBlock {
  page: number
  limit: number
  total: number
  totalPage: number
}

interface PaginatedApiResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination?: PaginationBlock
  meta?: PaginationBlock
}

export type BroadcastDeliveryType = 'immediate' | 'scheduled'

export type BroadcastType =
  | 'platform_update'
  | 'emergency_alert'
  | 'airport_notice'
  | 'maintenance'
  | 'surge_opportunity'
  | 'weather_alert'
  | 'service_alert'

export type BroadcastTargetAudience =
  | 'by_tier'
  | 'by_state'
  | 'by_city'
  | 'all_passengers'
  | 'all_drivers'

export type BroadcastStatus = 'scheduled' | 'sent' | 'failed' | 'cancelled'

export interface BroadcastTargetFilters {
  city?: string
  state?: string
  tier?: string
  userIds?: string[]
}

export interface BroadcastCreatedBy {
  _id: string
  name?: string
  email?: string
  profileImage?: string
}

export interface BroadcastWritePayload {
  title: string
  message: string
  type: BroadcastType
  deliveryType: BroadcastDeliveryType
  targetAudience: BroadcastTargetAudience
  targetFilters?: BroadcastTargetFilters
  scheduledAt?: string
}

export interface BroadcastItem {
  _id: string
  title: string
  message: string
  type: BroadcastType
  deliveryType: BroadcastDeliveryType
  targetAudience: BroadcastTargetAudience
  targetFilters?: BroadcastTargetFilters
  scheduledAt?: string
  status: BroadcastStatus | string
  createdBy?: BroadcastCreatedBy | string
  recipientCount?: number
  deliveredCount?: number
  failedCount?: number
  failureReason?: string
  sentAt?: string
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface BroadcastsQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: string
  type?: BroadcastType | string
}

export interface BroadcastsListResult {
  data: BroadcastItem[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

function mapPagination(response: PaginatedApiResponse<BroadcastItem>): BroadcastsListResult {
  const pagination = response.pagination ?? response.meta
  return {
    data: response.data ?? [],
    meta: {
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? 10,
      totalItems: pagination?.total ?? response.data?.length ?? 0,
      totalPages: pagination?.totalPage ?? 1,
    },
  }
}

export const broadcastsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBroadcastsList: builder.query<BroadcastsListResult, BroadcastsQueryParams | void>({
      query: ({ page = 1, limit = 10, searchTerm, status, type } = {}) => ({
        url: '/broadcasts',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
          type,
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<BroadcastItem>) =>
        mapPagination(response),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Broadcasts' as const, id: _id })),
              { type: 'Broadcasts', id: 'LIST' },
            ]
          : [{ type: 'Broadcasts', id: 'LIST' }],
    }),

    createBroadcast: builder.mutation<BroadcastItem, BroadcastWritePayload>({
      query: (body) => ({
        url: '/broadcasts',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<BroadcastItem>) => response.data,
      invalidatesTags: [{ type: 'Broadcasts', id: 'LIST' }],
    }),

    cancelBroadcast: builder.mutation<BroadcastItem, string>({
      query: (id) => ({
        url: `/broadcasts/${id}/cancel`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<BroadcastItem>) => response.data,
      invalidatesTags: (_res, _err, id) => [
        { type: 'Broadcasts', id },
        { type: 'Broadcasts', id: 'LIST' },
      ],
    }),

    deleteBroadcast: builder.mutation<void, string>({
      query: (id) => ({
        url: `/broadcasts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Broadcasts', id },
        { type: 'Broadcasts', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetBroadcastsListQuery,
  useCreateBroadcastMutation,
  useCancelBroadcastMutation,
  useDeleteBroadcastMutation,
} = broadcastsApi
