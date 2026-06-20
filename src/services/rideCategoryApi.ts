import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { cancellationApi } from '@/services/cancellationApi'
import {
  createDefaultCancellationRules,
  isRideCategoryInUse,
  mockRideCategories,
  toRideCategorySlug,
} from '@/services/mock/rideCategoryData'
import type {
  RideCategoryDefinition,
  RideCategoryFormValues,
  RideCategoryListParams,
  RideCategoryListResponse,
} from '@/types/rideCategoryManagement'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

function filterCategories(params: RideCategoryListParams): RideCategoryListResponse {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const search = (params.search ?? '').trim().toLowerCase()
  const status = params.status

  let filtered = [...mockRideCategories]

  if (search) {
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search) ||
        c.slug.includes(search),
    )
  }

  if (status) {
    filtered = filtered.filter((c) => c.status === status)
  }

  const start = (page - 1) * pageSize
  return {
    data: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  }
}

function invalidateCancellationPolicyTags(dispatch: (action: unknown) => void) {
  dispatch(cancellationApi.util.invalidateTags(['CancellationFees', 'NoShowPolicies']))
}

export const rideCategoryApi = createApi({
  reducerPath: 'rideCategoryApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['RideCategories'],
  endpoints: (builder) => ({
    getRideCategories: builder.query<RideCategoryListResponse, RideCategoryListParams | void>({
      queryFn: async (params) => {
        await delay()
        return { data: filterCategories(params ?? {}) }
      },
      providesTags: ['RideCategories'],
    }),
    createRideCategory: builder.mutation<RideCategoryDefinition, RideCategoryFormValues>({
      queryFn: async (values) => {
        await delay()
        const slug = toRideCategorySlug(values.name)
        if (mockRideCategories.some((c) => c.slug === slug)) {
          return { error: { status: 409, data: 'A category with this name already exists.' } }
        }
        const category: RideCategoryDefinition = {
          id: `RC-${Date.now()}`,
          slug,
          ...values,
          cancellationRules: values.cancellationRules ?? createDefaultCancellationRules(values.fareMultiplier),
          createdAt: new Date().toISOString(),
        }
        mockRideCategories.unshift(category)
        return { data: category }
      },
      invalidatesTags: ['RideCategories'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          invalidateCancellationPolicyTags(dispatch)
        } catch {
          // Ignore invalidation when create fails.
        }
      },
    }),
    updateRideCategory: builder.mutation<
      RideCategoryDefinition,
      { id: string } & RideCategoryFormValues
    >({
      queryFn: async ({ id, ...values }) => {
        await delay()
        const index = mockRideCategories.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Category not found' } }

        const slug = toRideCategorySlug(values.name)
        if (mockRideCategories.some((c) => c.slug === slug && c.id !== id)) {
          return { error: { status: 409, data: 'A category with this name already exists.' } }
        }

        mockRideCategories[index] = {
          ...mockRideCategories[index],
          ...values,
          slug,
        }
        return { data: mockRideCategories[index] }
      },
      invalidatesTags: ['RideCategories'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          invalidateCancellationPolicyTags(dispatch)
        } catch {
          // Ignore invalidation when update fails.
        }
      },
    }),
    deleteRideCategory: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockRideCategories.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Category not found' } }

        const category = mockRideCategories[index]
        if (isRideCategoryInUse(category.slug)) {
          return {
            error: {
              status: 409,
              data: 'This category is in use by active trips, drivers, or reservations and cannot be deleted.',
            },
          }
        }

        mockRideCategories.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['RideCategories'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          invalidateCancellationPolicyTags(dispatch)
        } catch {
          // Ignore invalidation when delete fails.
        }
      },
    }),
    toggleRideCategoryStatus: builder.mutation<RideCategoryDefinition, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockRideCategories.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Category not found' } }

        mockRideCategories[index] = {
          ...mockRideCategories[index],
          status: mockRideCategories[index].status === 'enabled' ? 'disabled' : 'enabled',
        }
        return { data: mockRideCategories[index] }
      },
      invalidatesTags: ['RideCategories'],
    }),
  }),
})

export const {
  useGetRideCategoriesQuery,
  useCreateRideCategoryMutation,
  useUpdateRideCategoryMutation,
  useDeleteRideCategoryMutation,
  useToggleRideCategoryStatusMutation,
} = rideCategoryApi
