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

export type TierSupportLevel = 'basic' | 'vip' | 'premium'
export type TierStatus = 'active' | 'inactive'

export interface TierRequirements {
  pointsRequired: number
  tripsRequired: number
  ratingRequired: number
  acceptanceRateRequired: number
}

export interface TierBenefits {
  destinationFilter: {
    enabled: boolean
    dailyLimit: number
  }
  priorityDispatch: {
    enabled: boolean
    boostMultiplier: number
  }
  reservationAccess: {
    enabled: boolean
    maxAdvanceHours: number
  }
  premiumRideAccess: {
    enabled: boolean
    allowedCategories: string[]
  }
  airportQueuePriority: {
    enabled: boolean
    priorityPosition: number
  }
  bonusMultiplier: {
    enabled: boolean
    multiplierValue: number
  }
  vipSupport: {
    enabled: boolean
    supportLevel: TierSupportLevel
  }
}

export interface TierWritePayload {
  name: string
  code: string
  level: number
  requirements: TierRequirements
  benefits: TierBenefits
}

export interface TierItem extends TierWritePayload {
  _id: string
  status: TierStatus
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface TiersQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: TierStatus | string
}

export interface TiersListResult {
  data: TierItem[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface UpdateTierArgs {
  id: string
  body: TierWritePayload
}

export interface UpdateTierStatusArgs {
  id: string
  status: TierStatus
}

function mapMeta(meta: PaginationMeta | undefined, count: number) {
  return {
    page: meta?.page ?? 1,
    limit: meta?.limit ?? 10,
    totalItems: meta?.total ?? count,
    totalPages: meta?.totalPage ?? 1,
  }
}

export const tiersManagementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTiersList: builder.query<TiersListResult, TiersQueryParams | void>({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/tiers',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<TierItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Tiers' as const, id: _id })),
              { type: 'Tiers', id: 'LIST' },
            ]
          : [{ type: 'Tiers', id: 'LIST' }],
    }),

    getSingleTier: builder.query<TierItem, string>({
      query: (id) => ({
        url: `/tiers/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<TierItem>) => response.data,
      providesTags: (_res, _err, id) => [{ type: 'Tiers', id }],
    }),

    createTier: builder.mutation<TierItem, TierWritePayload>({
      query: (body) => ({
        url: '/tiers',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<TierItem>) => response.data,
      invalidatesTags: [{ type: 'Tiers', id: 'LIST' }],
    }),

    updateTier: builder.mutation<TierItem, UpdateTierArgs>({
      query: ({ id, body }) => ({
        url: `/tiers/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<TierItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Tiers', id },
        { type: 'Tiers', id: 'LIST' },
      ],
    }),

    updateTierStatus: builder.mutation<TierItem, UpdateTierStatusArgs>({
      query: ({ id, status }) => ({
        url: `/tiers/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: ApiResponse<TierItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Tiers', id },
        { type: 'Tiers', id: 'LIST' },
      ],
    }),

    deleteTier: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tiers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Tiers', id },
        { type: 'Tiers', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetTiersListQuery,
  useGetSingleTierQuery,
  useCreateTierMutation,
  useUpdateTierMutation,
  useUpdateTierStatusMutation,
  useDeleteTierMutation,
} = tiersManagementsApi
