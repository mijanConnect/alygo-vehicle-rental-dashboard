import { baseApi } from '@/redux/baseApi'
import type { ChartPoint } from '@/types'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface CancellationAnalyticsSummary {
  totalCancellations: number
  passengerCancellations: number
  driverCancellations: number
  feesCollected: number
  totalDriverPaid: number
}

interface TrendPoint {
  day: string
  cancelledRides: number
}

interface ReasonPoint {
  reason: string
  count: number
}

interface CityPoint {
  city: string
  total: number
}

interface CategoryPoint {
  category: string
  count: number
}

export const drivingHoursApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDrivingHoursSummary: builder.query<CancellationAnalyticsSummary, void>({
      query: () => ({
        url: '/admin/analytics/admin/analytics/cancellations/summary',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<CancellationAnalyticsSummary>) =>
        response.data,
      providesTags: ['CancellationAnalytics'],
    }),

    getDrivingHoursTrends: builder.query<ChartPoint[], void>({
      query: () => ({
        url: '/admin/analytics/admin/analytics/cancellations/trend',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<TrendPoint[]>) =>
        (response.data ?? []).map((point) => ({
          label: point.day,
          value: point.cancelledRides,
        })),
      providesTags: ['CancellationAnalytics'],
    }),

    getDrivingHoursReasonsStats: builder.query<ChartPoint[], void>({
      query: () => ({
        url: '/admin/analytics/admin/analytics/cancellations/reasons',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<ReasonPoint[]>) =>
        (response.data ?? []).map((point) => ({
          label: point.reason,
          value: point.count,
        })),
      providesTags: ['CancellationAnalytics'],
    }),

    getDrivingHoursByCities: builder.query<ChartPoint[], void>({
      query: () => ({
        url: '/admin/analytics/admin/analytics/cancellations/cities',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<CityPoint[]>) =>
        (response.data ?? []).map((point) => ({
          label: point.city,
          value: point.total,
        })),
      providesTags: ['CancellationAnalytics'],
    }),

    getDrivingHoursByCategories: builder.query<ChartPoint[], void>({
      query: () => ({
        url: '/admin/analytics/admin/analytics/cancellations/categories',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<CategoryPoint[]>) =>
        (response.data ?? []).map((point) => ({
          label: point.category,
          value: point.count,
        })),
      providesTags: ['CancellationAnalytics'],
    }),
  }),
})

export const {
  useGetDrivingHoursSummaryQuery,
  useGetDrivingHoursTrendsQuery,
  useGetDrivingHoursReasonsStatsQuery,
  useGetDrivingHoursByCitiesQuery,
  useGetDrivingHoursByCategoriesQuery,
} = drivingHoursApi
