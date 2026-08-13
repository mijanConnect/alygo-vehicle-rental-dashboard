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

export type PeakHourStatus = 'active' | 'inactive'

export type PeakHourDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface PeakHourWritePayload {
  name: string
  startTime: string
  endTime: string
  timezone: string
  applicableDays: PeakHourDay[]
}

export interface PeakHourItem {
  _id: string
  name: string
  startTime: string
  endTime: string
  timezone: string
  applicableDays: PeakHourDay[]
  status: PeakHourStatus
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PeakHoursQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: PeakHourStatus | string
}

export interface PeakHoursListResult {
  data: PeakHourItem[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface UpdatePeakHourArgs {
  id: string
  body: PeakHourWritePayload
}

export interface UpdatePeakHourStatusArgs {
  id: string
  status: PeakHourStatus
}

function mapMeta(meta: PaginationMeta | undefined, count: number) {
  return {
    page: meta?.page ?? 1,
    limit: meta?.limit ?? 10,
    totalItems: meta?.total ?? count,
    totalPages: meta?.totalPage ?? 1,
  }
}

export const pickHoursApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPickHoursList: builder.query<PeakHoursListResult, PeakHoursQueryParams | void>({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/peak-hours',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<PeakHourItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'PeakHours' as const, id: _id })),
              { type: 'PeakHours', id: 'LIST' },
            ]
          : [{ type: 'PeakHours', id: 'LIST' }],
    }),

    getSinglePickHour: builder.query<PeakHourItem, string>({
      query: (id) => ({
        url: `/peak-hours/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<PeakHourItem>) => response.data,
      providesTags: (_res, _err, id) => [{ type: 'PeakHours', id }],
    }),

    createPickHour: builder.mutation<PeakHourItem, PeakHourWritePayload>({
      query: (body) => ({
        url: '/peak-hours',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<PeakHourItem>) => response.data,
      invalidatesTags: [{ type: 'PeakHours', id: 'LIST' }],
    }),

    updatePickHour: builder.mutation<PeakHourItem, UpdatePeakHourArgs>({
      query: ({ id, body }) => ({
        url: `/peak-hours/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<PeakHourItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'PeakHours', id },
        { type: 'PeakHours', id: 'LIST' },
      ],
    }),

    updatePickHourStatus: builder.mutation<PeakHourItem, UpdatePeakHourStatusArgs>({
      query: ({ id, status }) => ({
        url: `/peak-hours/status/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: ApiResponse<PeakHourItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'PeakHours', id },
        { type: 'PeakHours', id: 'LIST' },
      ],
    }),

    deletePickHour: builder.mutation<void, string>({
      query: (id) => ({
        url: `/peak-hours/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'PeakHours', id },
        { type: 'PeakHours', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetPickHoursListQuery,
  useGetSinglePickHourQuery,
  useCreatePickHourMutation,
  useUpdatePickHourMutation,
  useUpdatePickHourStatusMutation,
  useDeletePickHourMutation,
} = pickHoursApi
