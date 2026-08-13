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

export type FareConfigurationStatus = 'active' | 'inactive'

export interface FareServiceAreaRef {
  _id: string
  type?: string
  country?: string
  state?: string
  city?: string
  zone?: string
  airport?: string
  status?: string
}

export interface FareRideCategoryRef {
  _id: string
  name?: string
  description?: string
  status?: string
}

export interface FareConfigurationWritePayload {
  serviceAreaId: string
  rideCategoryId?: string
  baseFare: number
  perKmFare: number
  perMinuteFare: number
  waitingFeePerMinute: number
  minimumFare: number
}

export interface FareConfigurationItem {
  _id: string
  serviceAreaId: string | FareServiceAreaRef | null
  rideCategoryId: string | FareRideCategoryRef | null
  baseFare: number
  perKmFare: number
  perMinuteFare: number
  waitingFeePerMinute: number
  minimumFare: number
  status: FareConfigurationStatus
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface FareConfigurationsQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: FareConfigurationStatus | string
}

export interface FareConfigurationsListResult {
  data: FareConfigurationItem[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface UpdateFareConfigurationArgs {
  id: string
  body: FareConfigurationWritePayload
}

export interface UpdateFareConfigurationStatusArgs {
  id: string
  status: FareConfigurationStatus
}

function mapMeta(meta: PaginationMeta | undefined, count: number) {
  return {
    page: meta?.page ?? 1,
    limit: meta?.limit ?? 10,
    totalItems: meta?.total ?? count,
    totalPages: meta?.totalPage ?? 1,
  }
}

export const fareConfigurationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFareConfigurations: builder.query<
      FareConfigurationsListResult,
      FareConfigurationsQueryParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/fare-configurations',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<FareConfigurationItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: 'FareConfigurations' as const,
                id: _id,
              })),
              { type: 'FareConfigurations', id: 'LIST' },
            ]
          : [{ type: 'FareConfigurations', id: 'LIST' }],
    }),

    createFareConfiguration: builder.mutation<
      FareConfigurationItem,
      FareConfigurationWritePayload
    >({
      query: (body) => ({
        url: '/fare-configurations',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<FareConfigurationItem>) => response.data,
      invalidatesTags: [{ type: 'FareConfigurations', id: 'LIST' }],
    }),

    updateFareConfiguration: builder.mutation<
      FareConfigurationItem,
      UpdateFareConfigurationArgs
    >({
      query: ({ id, body }) => ({
        url: `/fare-configurations/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<FareConfigurationItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'FareConfigurations', id },
        { type: 'FareConfigurations', id: 'LIST' },
      ],
    }),

    updateFareConfigurationStatus: builder.mutation<
      FareConfigurationItem,
      UpdateFareConfigurationStatusArgs
    >({
      query: ({ id, status }) => ({
        url: `/fare-configurations/status/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: ApiResponse<FareConfigurationItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'FareConfigurations', id },
        { type: 'FareConfigurations', id: 'LIST' },
      ],
    }),

    deleteFareConfiguration: builder.mutation<void, string>({
      query: (id) => ({
        url: `/fare-configurations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'FareConfigurations', id },
        { type: 'FareConfigurations', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetFareConfigurationsQuery,
  useCreateFareConfigurationMutation,
  useUpdateFareConfigurationMutation,
  useUpdateFareConfigurationStatusMutation,
  useDeleteFareConfigurationMutation,
} = fareConfigurationsApi
