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

export type RideCategoryStatus = 'active' | 'inactive'

export interface RideCategoryVehicleRequirements {
  vehicleTypes: string[]
  minimumSeats: number
  luggageCapacity?: number
}

export interface ServiceCategoryRef {
  _id: string
  name: string
  description?: string
  image?: string
  status?: string
  supportsReservation?: boolean
  minimumAdvanceBookingMinutes?: number
  maximumAdvanceBookingDays?: number
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface RideCategoryWritePayload {
  serviceCategoryId?: string
  name: string
  description: string
  commissionRate: number
  minimumDriverRating: number
  vehicleRequirements: RideCategoryVehicleRequirements
}

export interface RideCategoryItem {
  _id: string
  name: string
  description: string
  commissionRate: number
  minimumDriverRating: number
  vehicleRequirements: RideCategoryVehicleRequirements
  status: RideCategoryStatus
  supportsReservation?: boolean
  reservationFee?: number
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
  serviceCategoryId?: string | ServiceCategoryRef
}

export interface RideCategoriesQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: RideCategoryStatus | string
}

export interface RideCategoriesListResult {
  data: RideCategoryItem[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface UpdateRideCategoryArgs {
  id: string
  body: RideCategoryWritePayload
}

export interface UpdateRideCategoryStatusArgs {
  id: string
  status: RideCategoryStatus
}

function mapMeta(meta: PaginationMeta | undefined, count: number) {
  return {
    page: meta?.page ?? 1,
    limit: meta?.limit ?? 10,
    totalItems: meta?.total ?? count,
    totalPages: meta?.totalPage ?? 1,
  }
}

export const rideCategoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRideCategoriesList: builder.query<
      RideCategoriesListResult,
      RideCategoriesQueryParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/ride-categories',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<RideCategoryItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'RideCategories' as const, id: _id })),
              { type: 'RideCategories', id: 'LIST' },
            ]
          : [{ type: 'RideCategories', id: 'LIST' }],
    }),

    getActiveRideCategories: builder.query<
      RideCategoriesListResult,
      RideCategoriesQueryParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm } = {}) => ({
        url: '/ride-categories/active',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<RideCategoryItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: [{ type: 'RideCategories', id: 'ACTIVE' }],
    }),

    getSingleRideCategory: builder.query<RideCategoryItem, string>({
      query: (id) => ({
        url: `/ride-categories/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<RideCategoryItem>) => response.data,
      providesTags: (_res, _err, id) => [{ type: 'RideCategories', id }],
    }),

    createRideCategory: builder.mutation<RideCategoryItem, RideCategoryWritePayload>({
      query: (body) => ({
        url: '/ride-categories',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<RideCategoryItem>) => response.data,
      invalidatesTags: [
        { type: 'RideCategories', id: 'LIST' },
        { type: 'RideCategories', id: 'ACTIVE' },
      ],
    }),

    updateRideCategory: builder.mutation<RideCategoryItem, UpdateRideCategoryArgs>({
      query: ({ id, body }) => ({
        url: `/ride-categories/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<RideCategoryItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'RideCategories', id },
        { type: 'RideCategories', id: 'LIST' },
        { type: 'RideCategories', id: 'ACTIVE' },
      ],
    }),

    updateRideCategoryStatus: builder.mutation<RideCategoryItem, UpdateRideCategoryStatusArgs>({
      query: ({ id, status }) => ({
        url: `/ride-categories/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: ApiResponse<RideCategoryItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'RideCategories', id },
        { type: 'RideCategories', id: 'LIST' },
        { type: 'RideCategories', id: 'ACTIVE' },
      ],
    }),

    deleteRideCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/ride-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'RideCategories', id },
        { type: 'RideCategories', id: 'LIST' },
        { type: 'RideCategories', id: 'ACTIVE' },
      ],
    }),
  }),
})

export const {
  useGetRideCategoriesListQuery,
  useGetActiveRideCategoriesQuery,
  useGetSingleRideCategoryQuery,
  useCreateRideCategoryMutation,
  useUpdateRideCategoryMutation,
  useUpdateRideCategoryStatusMutation,
  useDeleteRideCategoryMutation,
} = rideCategoriesApi
