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

export type HolidayStatus = 'active' | 'inactive'

export interface HolidayWritePayload {
  holidayName: string
  timezone: string
  startDate: string
  endDate: string
  description: string
}

export interface HolidayItem {
  _id: string
  holidayName: string
  timezone: string
  startDate: string
  endDate: string
  description: string
  status: HolidayStatus
  isDeleted?: boolean
  deletedAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface HolidaysQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: HolidayStatus | string
}

export interface HolidaysListResult {
  data: HolidayItem[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface UpdateHolidayArgs {
  id: string
  body: HolidayWritePayload
}

export interface UpdateHolidayStatusArgs {
  id: string
  status: HolidayStatus
}

function mapMeta(meta: PaginationMeta | undefined, count: number) {
  return {
    page: meta?.page ?? 1,
    limit: meta?.limit ?? 10,
    totalItems: meta?.total ?? count,
    totalPages: meta?.totalPage ?? 1,
  }
}

export const holidayManageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHolidaysList: builder.query<HolidaysListResult, HolidaysQueryParams | void>({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/holidays',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<HolidayItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Holidays' as const, id: _id })),
              { type: 'Holidays', id: 'LIST' },
            ]
          : [{ type: 'Holidays', id: 'LIST' }],
    }),

    getSingleHoliday: builder.query<HolidayItem, string>({
      query: (id) => ({
        url: `/holidays/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<HolidayItem>) => response.data,
      providesTags: (_res, _err, id) => [{ type: 'Holidays', id }],
    }),

    createHoliday: builder.mutation<HolidayItem, HolidayWritePayload>({
      query: (body) => ({
        url: '/holidays',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<HolidayItem>) => response.data,
      invalidatesTags: [{ type: 'Holidays', id: 'LIST' }],
    }),

    updateHoliday: builder.mutation<HolidayItem, UpdateHolidayArgs>({
      query: ({ id, body }) => ({
        url: `/holidays/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<HolidayItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Holidays', id },
        { type: 'Holidays', id: 'LIST' },
      ],
    }),

    updateHolidayStatus: builder.mutation<HolidayItem, UpdateHolidayStatusArgs>({
      query: ({ id, status }) => ({
        url: `/holidays/status/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: ApiResponse<HolidayItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Holidays', id },
        { type: 'Holidays', id: 'LIST' },
      ],
    }),

    deleteHoliday: builder.mutation<void, string>({
      query: (id) => ({
        url: `/holidays/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Holidays', id },
        { type: 'Holidays', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetHolidaysListQuery,
  useGetSingleHolidayQuery,
  useCreateHolidayMutation,
  useUpdateHolidayMutation,
  useUpdateHolidayStatusMutation,
  useDeleteHolidayMutation,
} = holidayManageApi
