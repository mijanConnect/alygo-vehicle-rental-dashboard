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

export type SurgeRuleType =
  | 'default_surge'
  | 'airport_surge'
  | 'event_surge'
  | 'peak_hour_surge'
  | 'holiday_surge'

export type SurgeRuleStatus = 'active' | 'inactive'

export interface SurgeRuleWritePayload {
  ruleName: string
  ruleType: SurgeRuleType
  demandThreshold: number
  supplyThreshold: number
  minMultiplier: number
  maxMultiplier: number
}

export interface SurgeRuleItem extends SurgeRuleWritePayload {
  _id: string
  status: SurgeRuleStatus
  createdBy?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
  isDeleted?: boolean
}

export interface DynamicPricingQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: SurgeRuleStatus | string
}

export interface DynamicPricingListResult {
  data: SurgeRuleItem[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface UpdateDynamicPricingArgs {
  id: string
  body: SurgeRuleWritePayload
}

export interface UpdateDynamicPricingStatusArgs {
  id: string
  status: SurgeRuleStatus
}

function mapMeta(meta: PaginationMeta | undefined, count: number) {
  return {
    page: meta?.page ?? 1,
    limit: meta?.limit ?? 10,
    totalItems: meta?.total ?? count,
    totalPages: meta?.totalPage ?? 1,
  }
}

export const dynamicPricingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDynamicPricingList: builder.query<
      DynamicPricingListResult,
      DynamicPricingQueryParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/surge-rules',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<SurgeRuleItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Pricing' as const, id: _id })),
              { type: 'Pricing', id: 'LIST' },
            ]
          : [{ type: 'Pricing', id: 'LIST' }],
    }),

    getSingleDynamicPricing: builder.query<SurgeRuleItem, string>({
      query: (id) => ({
        url: `/surge-rules/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<SurgeRuleItem>) => response.data,
      providesTags: (_res, _err, id) => [{ type: 'Pricing', id }],
    }),

    getActiveDynamicPricing: builder.query<SurgeRuleItem[], void>({
      query: () => ({
        url: '/surge-rules/active',
        method: 'GET',
      }),
      transformResponse: (
        response: ApiResponse<SurgeRuleItem[] | SurgeRuleItem>,
      ) => (Array.isArray(response.data) ? response.data : response.data ? [response.data] : []),
      providesTags: [{ type: 'Pricing', id: 'ACTIVE' }],
    }),

    createDynamicPricing: builder.mutation<SurgeRuleItem, SurgeRuleWritePayload>({
      query: (body) => ({
        url: '/surge-rules',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<SurgeRuleItem>) => response.data,
      invalidatesTags: [
        { type: 'Pricing', id: 'LIST' },
        { type: 'Pricing', id: 'ACTIVE' },
      ],
    }),

    updateDynamicPricing: builder.mutation<SurgeRuleItem, UpdateDynamicPricingArgs>({
      query: ({ id, body }) => ({
        url: `/surge-rules/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<SurgeRuleItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Pricing', id },
        { type: 'Pricing', id: 'LIST' },
        { type: 'Pricing', id: 'ACTIVE' },
      ],
    }),

    updateDynamicPricingStatus: builder.mutation<
      SurgeRuleItem,
      UpdateDynamicPricingStatusArgs
    >({
      query: ({ id, status }) => ({
        url: `/surge-rules/status/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: ApiResponse<SurgeRuleItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Pricing', id },
        { type: 'Pricing', id: 'LIST' },
        { type: 'Pricing', id: 'ACTIVE' },
      ],
    }),

    deleteDynamicPricing: builder.mutation<void, string>({
      query: (id) => ({
        url: `/surge-rules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Pricing', id },
        { type: 'Pricing', id: 'LIST' },
        { type: 'Pricing', id: 'ACTIVE' },
      ],
    }),
  }),
})

export const {
  useGetDynamicPricingListQuery,
  useGetSingleDynamicPricingQuery,
  useGetActiveDynamicPricingQuery,
  useCreateDynamicPricingMutation,
  useUpdateDynamicPricingMutation,
  useUpdateDynamicPricingStatusMutation,
  useDeleteDynamicPricingMutation,
} = dynamicPricingApi
