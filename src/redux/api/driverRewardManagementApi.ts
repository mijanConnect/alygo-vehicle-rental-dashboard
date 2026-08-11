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

export type PointRuleActionType = 'earning' | 'deduction'

export type PointRuleEventType =
  | 'admin_override'
  | 'policy_violation'
  | 'accepted_ride_cancelled'
  | 'referral_completed'
  | 'peak_hour_ride'
  | 'scheduled_ride'
  | 'airport_ride'
  | 'five_star_rating'
  | 'ride_completed'

export type PointRuleStatus = 'active' | 'inactive'

export interface PointRuleWritePayload {
  name: string
  eventType: PointRuleEventType
  points: number
  actionType: PointRuleActionType
}

export interface PointRuleItem extends PointRuleWritePayload {
  _id: string
  status: PointRuleStatus
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PointRulesQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: PointRuleStatus | string
  actionType?: PointRuleActionType
}

export interface PointRulesListResult {
  data: PointRuleItem[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface UpdatePointRuleArgs {
  id: string
  body: PointRuleWritePayload
}

export interface OverridePointsPayload {
  driverUserId: string
  points: number
  notes: string
}

export interface OverrideTierPayload {
  driverUserId: string
  tierId: string
  reason: string
}

function mapMeta(meta: PaginationMeta | undefined, count: number) {
  return {
    page: meta?.page ?? 1,
    limit: meta?.limit ?? 10,
    totalItems: meta?.total ?? count,
    totalPages: meta?.totalPage ?? 1,
  }
}

export const driverRewardManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPointRulesList: builder.query<PointRulesListResult, PointRulesQueryParams | void>({
      query: ({ page = 1, limit = 10, searchTerm, status, actionType } = {}) => ({
        url: '/rewards/point-rules',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
          actionType,
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<PointRuleItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: (result, _err, arg) => {
        const actionType = arg?.actionType ?? 'all'
        return result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'DriverRewards' as const, id: _id })),
              { type: 'DriverRewards', id: `LIST-${actionType}` },
            ]
          : [{ type: 'DriverRewards', id: `LIST-${actionType}` }]
      },
    }),

    getSinglePointRule: builder.query<PointRuleItem, string>({
      query: (id) => ({
        url: `/rewards/point-rules/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<PointRuleItem>) => response.data,
      providesTags: (_res, _err, id) => [{ type: 'DriverRewards', id }],
    }),

    createPointRule: builder.mutation<PointRuleItem, PointRuleWritePayload>({
      query: (body) => ({
        url: '/rewards/point-rules',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<PointRuleItem>) => response.data,
      invalidatesTags: (_res, _err, body) => [
        { type: 'DriverRewards', id: `LIST-${body.actionType}` },
        { type: 'DriverRewards', id: 'LIST-all' },
      ],
    }),

    updatePointRule: builder.mutation<PointRuleItem, UpdatePointRuleArgs>({
      query: ({ id, body }) => ({
        url: `/rewards/point-rules/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<PointRuleItem>) => response.data,
      invalidatesTags: (_res, _err, { id, body }) => [
        { type: 'DriverRewards', id },
        { type: 'DriverRewards', id: `LIST-${body.actionType}` },
        { type: 'DriverRewards', id: 'LIST-all' },
      ],
    }),

    deletePointRule: builder.mutation<void, { id: string; actionType?: PointRuleActionType }>({
      query: ({ id }) => ({
        url: `/rewards/point-rules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, { id, actionType }) => [
        { type: 'DriverRewards', id },
        { type: 'DriverRewards', id: `LIST-${actionType ?? 'all'}` },
        { type: 'DriverRewards', id: 'LIST-all' },
      ],
    }),

    adminOverridePoints: builder.mutation<unknown, OverridePointsPayload>({
      query: (body) => ({
        url: '/rewards/override-points',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<unknown>) => response.data,
      invalidatesTags: [
        { type: 'DriverRewards', id: 'LIST-all' },
        'Drivers',
      ],
    }),

    adminOverrideTier: builder.mutation<unknown, OverrideTierPayload>({
      query: (body) => ({
        url: '/rewards/override-tier',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<unknown>) => response.data,
      invalidatesTags: [
        { type: 'DriverRewards', id: 'LIST-all' },
        'Drivers',
        'Tiers',
      ],
    }),
  }),
})

export const {
  useGetPointRulesListQuery,
  useGetSinglePointRuleQuery,
  useCreatePointRuleMutation,
  useUpdatePointRuleMutation,
  useDeletePointRuleMutation,
  useAdminOverridePointsMutation,
  useAdminOverrideTierMutation,
} = driverRewardManagementApi
