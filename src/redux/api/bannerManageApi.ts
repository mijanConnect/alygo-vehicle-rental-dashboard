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

export type BannerStatus = 'active' | 'inactive'

export interface BannerWritePayload {
  name: string
  description: string
  image?: File
}

export interface BannerItem {
  _id: string
  name: string
  description: string
  image: string
  status: BannerStatus
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface BannerQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: BannerStatus | string
}

export interface BannerListResult {
  data: BannerItem[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface UpdateBannerArgs {
  id: string
  body: BannerWritePayload
}

export interface UpdateBannerStatusArgs {
  id: string
  status: boolean
}

function mapMeta(meta: PaginationMeta | undefined, count: number) {
  return {
    page: meta?.page ?? 1,
    limit: meta?.limit ?? 10,
    totalItems: meta?.total ?? count,
    totalPages: meta?.totalPage ?? 1,
  }
}

function buildBannerFormData(body: BannerWritePayload) {
  const formData = new FormData()
  formData.append(
    'data',
    JSON.stringify({
      name: body.name,
      description: body.description,
    }),
  )
  if (body.image) {
    formData.append('image', body.image)
  }
  return formData
}

export const bannerManageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBannerList: builder.query<BannerListResult, BannerQueryParams | void>({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/banners/all',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<BannerItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Banners' as const, id: _id })),
              { type: 'Banners', id: 'LIST' },
            ]
          : [{ type: 'Banners', id: 'LIST' }],
    }),

    getSingleBanner: builder.query<BannerItem, string>({
      query: (id) => ({
        url: `/banners/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<BannerItem>) => response.data,
      providesTags: (_res, _err, id) => [{ type: 'Banners', id }],
    }),

    createBanner: builder.mutation<BannerItem, BannerWritePayload>({
      query: (body) => ({
        url: '/banners',
        method: 'POST',
        body: buildBannerFormData(body),
      }),
      transformResponse: (response: ApiResponse<BannerItem>) => response.data,
      invalidatesTags: [{ type: 'Banners', id: 'LIST' }],
    }),

    updateBanner: builder.mutation<BannerItem, UpdateBannerArgs>({
      query: ({ id, body }) => ({
        url: `/banners/${id}`,
        method: 'PATCH',
        body: buildBannerFormData(body),
      }),
      transformResponse: (response: ApiResponse<BannerItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Banners', id },
        { type: 'Banners', id: 'LIST' },
      ],
    }),

    updateBannerStatus: builder.mutation<BannerItem, UpdateBannerStatusArgs>({
      query: ({ id, status }) => ({
        url: `/banners/status/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: ApiResponse<BannerItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Banners', id },
        { type: 'Banners', id: 'LIST' },
      ],
    }),

    deleteBanner: builder.mutation<void, string>({
      query: (id) => ({
        url: `/banners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Banners', id },
        { type: 'Banners', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetBannerListQuery,
  useGetSingleBannerQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useUpdateBannerStatusMutation,
  useDeleteBannerMutation,
} = bannerManageApi
