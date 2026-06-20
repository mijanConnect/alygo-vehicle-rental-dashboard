import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  CancellationAnalyticsSummary,
  CancellationFee,
  CancellationReason,
  CancellationReasonStat,
  CancellationReasonType,
  CancellationTrendPoint,
  CityCancellationPolicy,
  NoShowPolicy,
} from '@/types/cancellation'
import type { RideCategory } from '@/types'
import {
  generateReasonId,
  mockCancellationAnalyticsSummary,
  mockCancellationByCategory,
  mockCancellationByCity,
  mockCancellationTrend,
  mockCityPolicies,
  mockDriverCancellationReasons,
  mockPassengerCancellationReasons,
  mockTopCancellationReasons,
} from '@/services/mock/cancellationData'
import { mockRideCategories } from '@/services/mock/rideCategoryData'
import type { RideCategoryDefinition } from '@/types/rideCategoryManagement'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

function getReasonStore(type: CancellationReasonType) {
  return type === 'passenger' ? mockPassengerCancellationReasons : mockDriverCancellationReasons
}

function mapCategoryToCancellationFee(category: RideCategoryDefinition): CancellationFee {
  return {
    id: category.id,
    rideCategory: category.slug,
    fee: category.cancellationRules.cancellationFee,
    driverCompensation: category.cancellationRules.driverCompensation,
    status: category.cancellationRules.status,
  }
}

function mapCategoryToNoShowPolicy(category: RideCategoryDefinition): NoShowPolicy {
  return {
    id: category.id,
    rideCategory: category.slug,
    waitTimeMinutes: category.cancellationRules.waitTimeMinutes,
    noShowFee: category.cancellationRules.noShowFee,
    driverCompensation: category.cancellationRules.driverCompensation,
    status: category.cancellationRules.status,
  }
}

function findCategoryIndex(id: string) {
  return mockRideCategories.findIndex((category) => category.id === id)
}

export const cancellationApi = createApi({
  reducerPath: 'cancellationApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['CancellationReasons', 'CancellationFees', 'NoShowPolicies', 'CityPolicies', 'CancellationAnalytics'],
  endpoints: (builder) => ({
    getPassengerCancellationReasons: builder.query<CancellationReason[], void>({
      queryFn: async () => {
        await delay()
        return { data: [...mockPassengerCancellationReasons] }
      },
      providesTags: ['CancellationReasons'],
    }),
    getDriverCancellationReasons: builder.query<CancellationReason[], void>({
      queryFn: async () => {
        await delay()
        return { data: [...mockDriverCancellationReasons] }
      },
      providesTags: ['CancellationReasons'],
    }),
    getCancellationFees: builder.query<CancellationFee[], void>({
      queryFn: async () => {
        await delay()
        return { data: mockRideCategories.map(mapCategoryToCancellationFee) }
      },
      providesTags: ['CancellationFees'],
    }),
    getNoShowPolicies: builder.query<NoShowPolicy[], void>({
      queryFn: async () => {
        await delay()
        return { data: mockRideCategories.map(mapCategoryToNoShowPolicy) }
      },
      providesTags: ['NoShowPolicies'],
    }),
    getCityPolicies: builder.query<CityCancellationPolicy[], void>({
      queryFn: async () => ({ data: [...mockCityPolicies] }),
      providesTags: ['CityPolicies'],
    }),
    getCancellationAnalytics: builder.query<{
      summary: CancellationAnalyticsSummary
      trend: CancellationTrendPoint[]
      topReasons: CancellationReasonStat[]
      byCity: CancellationReasonStat[]
      byCategory: CancellationReasonStat[]
    }, void>({
      queryFn: async () => ({
        data: {
          summary: mockCancellationAnalyticsSummary,
          trend: mockCancellationTrend,
          topReasons: mockTopCancellationReasons,
          byCity: mockCancellationByCity,
          byCategory: mockCancellationByCategory,
        },
      }),
      providesTags: ['CancellationAnalytics'],
    }),
    createCancellationReason: builder.mutation<
      CancellationReason,
      { type: CancellationReasonType; name: string; sortOrder: number; status?: 'active' | 'inactive' }
    >({
      queryFn: async ({ type, name, sortOrder, status = 'active' }) => {
        await delay()
        const store = getReasonStore(type)
        const reason: CancellationReason = {
          id: generateReasonId(type === 'passenger' ? 'pcr' : 'dcr'),
          name,
          sortOrder,
          status,
        }
        store.unshift(reason)
        return { data: reason }
      },
      invalidatesTags: ['CancellationReasons'],
    }),
    updateCancellationReason: builder.mutation<
      CancellationReason,
      {
        type: CancellationReasonType
        id: string
        name: string
        sortOrder: number
        status: 'active' | 'inactive'
      }
    >({
      queryFn: async ({ type, id, name, sortOrder, status }) => {
        await delay()
        const store = getReasonStore(type)
        const index = store.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Reason not found' } }
        store[index] = { ...store[index], name, sortOrder, status }
        return { data: store[index] }
      },
      invalidatesTags: ['CancellationReasons'],
    }),
    toggleCancellationReasonStatus: builder.mutation<
      CancellationReason,
      { type: CancellationReasonType; id: string; status: 'active' | 'inactive' }
    >({
      queryFn: async ({ type, id, status }) => {
        await delay()
        const store = getReasonStore(type)
        const index = store.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Reason not found' } }
        store[index] = { ...store[index], status }
        return { data: store[index] }
      },
      invalidatesTags: ['CancellationReasons'],
    }),
    deleteCancellationReason: builder.mutation<void, { type: CancellationReasonType; id: string }>({
      queryFn: async ({ type, id }) => {
        await delay()
        const store = getReasonStore(type)
        const index = store.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Reason not found' } }
        store.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['CancellationReasons'],
    }),
    updateCancellationFee: builder.mutation<
      CancellationFee,
      Partial<Pick<CancellationFee, 'fee' | 'driverCompensation' | 'status'>> & { id: string }
    >({
      queryFn: async ({ id, fee, driverCompensation, status }) => {
        await delay()
        const index = findCategoryIndex(id)
        if (index === -1) return { error: { status: 404, data: 'Ride category not found' } }
        mockRideCategories[index] = {
          ...mockRideCategories[index],
          cancellationRules: {
            ...mockRideCategories[index].cancellationRules,
            ...(fee !== undefined && { cancellationFee: fee }),
            ...(driverCompensation !== undefined && { driverCompensation }),
            ...(status !== undefined && { status }),
          },
        }
        return { data: mapCategoryToCancellationFee(mockRideCategories[index]) }
      },
      invalidatesTags: ['CancellationFees', 'NoShowPolicies'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          const { rideCategoryApi } = await import('@/services/rideCategoryApi')
          dispatch(rideCategoryApi.util.invalidateTags(['RideCategories']))
        } catch {
          // Ignore invalidation when update fails.
        }
      },
    }),
    updateNoShowPolicy: builder.mutation<
      NoShowPolicy,
      Partial<Pick<NoShowPolicy, 'waitTimeMinutes' | 'noShowFee' | 'driverCompensation' | 'status'>> & {
        id: string
      }
    >({
      queryFn: async ({ id, waitTimeMinutes, noShowFee, driverCompensation, status }) => {
        await delay()
        const index = findCategoryIndex(id)
        if (index === -1) return { error: { status: 404, data: 'Ride category not found' } }
        mockRideCategories[index] = {
          ...mockRideCategories[index],
          cancellationRules: {
            ...mockRideCategories[index].cancellationRules,
            ...(waitTimeMinutes !== undefined && { waitTimeMinutes }),
            ...(noShowFee !== undefined && { noShowFee }),
            ...(driverCompensation !== undefined && { driverCompensation }),
            ...(status !== undefined && { status }),
          },
        }
        return { data: mapCategoryToNoShowPolicy(mockRideCategories[index]) }
      },
      invalidatesTags: ['CancellationFees', 'NoShowPolicies'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          const { rideCategoryApi } = await import('@/services/rideCategoryApi')
          dispatch(rideCategoryApi.util.invalidateTags(['RideCategories']))
        } catch {
          // Ignore invalidation when update fails.
        }
      },
    }),
    createCityPolicy: builder.mutation<
      CityCancellationPolicy,
      Omit<CityCancellationPolicy, 'id'>
    >({
      queryFn: async (payload) => {
        await delay()
        const policy: CityCancellationPolicy = { ...payload, id: `cp-${Date.now()}` }
        mockCityPolicies.unshift(policy)
        return { data: policy }
      },
      invalidatesTags: ['CityPolicies'],
    }),
    updateCityPolicy: builder.mutation<
      CityCancellationPolicy,
      Partial<CityCancellationPolicy> & { id: string }
    >({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockCityPolicies.findIndex((p) => p.id === id)
        if (index === -1) return { error: { status: 404, data: 'Policy not found' } }
        mockCityPolicies[index] = { ...mockCityPolicies[index], ...updates }
        return { data: mockCityPolicies[index] }
      },
      invalidatesTags: ['CityPolicies'],
    }),
    deleteCityPolicy: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockCityPolicies.findIndex((p) => p.id === id)
        if (index === -1) return { error: { status: 404, data: 'Policy not found' } }
        mockCityPolicies.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['CityPolicies'],
    }),
  }),
})

export const {
  useGetPassengerCancellationReasonsQuery,
  useGetDriverCancellationReasonsQuery,
  useGetCancellationFeesQuery,
  useGetNoShowPoliciesQuery,
  useGetCityPoliciesQuery,
  useGetCancellationAnalyticsQuery,
  useCreateCancellationReasonMutation,
  useUpdateCancellationReasonMutation,
  useToggleCancellationReasonStatusMutation,
  useDeleteCancellationReasonMutation,
  useUpdateCancellationFeeMutation,
  useUpdateNoShowPolicyMutation,
  useCreateCityPolicyMutation,
  useUpdateCityPolicyMutation,
  useDeleteCityPolicyMutation,
} = cancellationApi

export const RIDE_CATEGORY_OPTIONS: { value: RideCategory; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'comfort', label: 'Comfort' },
  { value: 'xl', label: 'XL' },
  { value: 'priority', label: 'Priority' },
  { value: 'pet', label: 'Pet' },
  { value: 'black', label: 'Black' },
  { value: 'black_suv', label: 'Black SUV' },
]
