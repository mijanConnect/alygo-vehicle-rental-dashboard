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

export type SupportPriority = 'low' | 'medium' | 'high' | string
export type SupportStatus = 'RESOLVED' | 'PENDING' | 'OPEN' | string

export interface SupportUser {
  _id: string
  role?: string
  email?: string
  profileImage?: string
  phone?: string
}

export interface HelpAndSupportsItem {
  _id: string
  userId?: SupportUser | string | null
  name: string
  email: string
  subject: string
  message: string
  priority: SupportPriority
  status?: SupportStatus
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface HelpAndSupportsQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  priority?: string
  status?: string
}

export interface HelpAndSupportsListResult {
  data: HelpAndSupportsItem[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface UpdateHelpAndSupportStatusArgs {
  id: string
  status: SupportStatus
}

interface NestedListPayload {
  data?: HelpAndSupportsItem[]
  meta?: PaginationMeta
}

function mapMeta(meta: PaginationMeta | undefined, count: number) {
  return {
    page: meta?.page ?? 1,
    limit: meta?.limit ?? 10,
    totalItems: meta?.total ?? count,
    totalPages: meta?.totalPage ?? 1,
  }
}

export const helpAndSupportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHelpAndSupportsList: builder.query<
      HelpAndSupportsListResult,
      HelpAndSupportsQueryParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, priority, status } = {}) => ({
        url: '/supports',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          priority,
          status,
        }),
      }),
      transformResponse: (response: ApiResponse<NestedListPayload | HelpAndSupportsItem[]>) => {
        const payload = response.data
        const rows = Array.isArray(payload)
          ? payload
          : (payload?.data ?? [])
        const meta = Array.isArray(payload) ? undefined : payload?.meta
        return {
          data: rows,
          meta: mapMeta(meta, rows.length),
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: 'HelpAndSupports' as const,
                id: _id,
              })),
              { type: 'HelpAndSupports', id: 'LIST' },
            ]
          : [{ type: 'HelpAndSupports', id: 'LIST' }],
    }),

    getSingleHelpAndSupport: builder.query<HelpAndSupportsItem, string>({
      query: (id) => ({
        url: `/supports/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<HelpAndSupportsItem>) => response.data,
      providesTags: (_res, _err, id) => [{ type: 'HelpAndSupports', id }],
    }),

    updateHelpAndSupportStatus: builder.mutation<
      HelpAndSupportsItem,
      UpdateHelpAndSupportStatusArgs
    >({
      query: ({ id, status }) => ({
        url: `/supports/${id}/review`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: ApiResponse<HelpAndSupportsItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'HelpAndSupports', id },
        { type: 'HelpAndSupports', id: 'LIST' },
      ],
    }),

    deleteHelpAndSupport: builder.mutation<void, string>({
      query: (id) => ({
        url: `/supports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'HelpAndSupports', id },
        { type: 'HelpAndSupports', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetHelpAndSupportsListQuery,
  useGetSingleHelpAndSupportQuery,
  useUpdateHelpAndSupportStatusMutation,
  useDeleteHelpAndSupportMutation,
} = helpAndSupportsApi
