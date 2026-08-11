import { baseApi } from '@/redux/baseApi'
import { cleanObject } from '@/utils/cleanObject'
import type { CancellationEntityStatus, CancellationReasonType } from '@/types/cancellation'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: CancellationReasonMetaRaw
}

interface CancellationReasonMetaRaw {
  page: number
  limit: number
  total: number
  totalPage: number
}

export interface CancellationReasonMeta {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface CancellationReasonApiItem {
  _id: string
  reasonName: string
  description: string
  userType: CancellationReasonType
  sortOrder?: number
  status: CancellationEntityStatus
  isDeleted?: boolean
  isActive?: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

/** UI-friendly row used by the reasons table */
export interface CancellationReasonRow {
  id: string
  name: string
  description: string
  userType: CancellationReasonType
  status: CancellationEntityStatus
  createdAt: string
  updatedAt: string
}

export interface CancellationReasonListResult {
  data: CancellationReasonRow[]
  meta: CancellationReasonMeta
}

export interface GetCancellationReasonsParams {
  page?: number
  limit?: number
  searchTerm?: string
  userType?: CancellationReasonType
  status?: CancellationEntityStatus
}

export interface CreateCancellationReasonBody {
  reasonName: string
  description: string
  userType: CancellationReasonType
}

export interface UpdateCancellationReasonBody {
  id: string
  reasonName: string
  description: string
  userType: CancellationReasonType
}

export interface UpdateCancellationReasonStatusBody {
  id: string
  status: CancellationEntityStatus
}

function mapReason(item: CancellationReasonApiItem): CancellationReasonRow {
  return {
    id: item._id,
    name: item.reasonName,
    description: item.description ?? '',
    userType: item.userType,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

export const cancellationApiReason = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCancellationReasons: builder.query<
      CancellationReasonListResult,
      GetCancellationReasonsParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, userType, status } = {}) => ({
        url: '/cancellation-reasons',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          userType,
          status,
        }),
      }),
      transformResponse: (response: ApiResponse<CancellationReasonApiItem[]>) => {
        const rows = (response.data ?? [])
          .filter((item) => !item.isDeleted)
          .map(mapReason)

        return {
          data: rows,
          meta: {
            page: response.meta?.page ?? 1,
            limit: response.meta?.limit ?? 10,
            totalItems: response.meta?.total ?? rows.length,
            totalPages: response.meta?.totalPage ?? 1,
          },
        }
      },
      providesTags: ['CancellationReason'],
    }),

    createCancellationReason: builder.mutation<
      CancellationReasonRow,
      CreateCancellationReasonBody
    >({
      query: (body) => ({
        url: '/cancellation-reasons',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<CancellationReasonApiItem>) =>
        mapReason(response.data),
      invalidatesTags: ['CancellationReason'],
    }),

    updateCancellationReason: builder.mutation<
      CancellationReasonRow,
      UpdateCancellationReasonBody
    >({
      query: ({ id, ...body }) => ({
        url: `/cancellation-reasons/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<CancellationReasonApiItem>) =>
        mapReason(response.data),
      invalidatesTags: ['CancellationReason'],
    }),

    updateCancellationReasonStatus: builder.mutation<
      CancellationReasonRow,
      UpdateCancellationReasonStatusBody
    >({
      query: ({ id, status }) => ({
        url: `/cancellation-reasons/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: ApiResponse<CancellationReasonApiItem>) =>
        mapReason(response.data),
      invalidatesTags: ['CancellationReason'],
    }),

    deleteCancellationReason: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/cancellation-reasons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CancellationReason'],
    }),
  }),
})

export const {
  useGetCancellationReasonsQuery,
  useCreateCancellationReasonMutation,
  useUpdateCancellationReasonMutation,
  useUpdateCancellationReasonStatusMutation,
  useDeleteCancellationReasonMutation,
} = cancellationApiReason
