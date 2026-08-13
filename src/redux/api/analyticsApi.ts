import { baseApi } from '@/redux/baseApi'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface RevenueTrendPoint {
  day: string
  revenue: number
}

export interface DemandTrendPoint {
  time: string
  demand: number
}

export interface DriverAnalyticsItem {
  month: string
  period: string
  count: number
  cumulative: number
}

export interface OverviewAnalyticsData {
  totalDrivers: number
  totalPassengers: number
  activeTrips: number
  revenueThisMonth: number
  scheduledRides: number
  completedTripsToday: number
  acceptanceRate: number
  completionRate: number
  cancellationRate: number
  activeReservations: number
  revenueTrend: RevenueTrendPoint[]
  demandTrend: DemandTrendPoint[]
}

export interface PassengerAnalyticsItem {
  month: string
  period: string
  count: number
  cumulative: number
}

export interface RevenueAnalyticsItem {
  date: string
  revenue: number
}

export interface DemandAnalyticsItem {
  hour: number
  label: string
  demand: number
}

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOverviewAnalytics: builder.query<OverviewAnalyticsData, void>({
      query: () => ({
        url: '/analytics/overview',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<OverviewAnalyticsData>) => response.data,
      providesTags: ['Analytics'],
    }),
    getDriverAnalytics: builder.query<DriverAnalyticsItem[], void>({
      query: () => ({
        url: '/analytics/drivers',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<DriverAnalyticsItem[]>) => response.data,
      providesTags: ['Analytics'],
    }),
    getPassengerAnalytics: builder.query<PassengerAnalyticsItem[], void>({
      query: () => ({
        url: '/analytics/passengers',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<PassengerAnalyticsItem[]>) => response.data,
      providesTags: ['Analytics'],
    }),
    getRevenueAnalytics: builder.query<RevenueAnalyticsItem[], void>({
      query: () => ({
        url: '/analytics/revenue',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<RevenueAnalyticsItem[]>) => response.data,
      providesTags: ['Analytics'],
    }),
    getDemandAnalytics: builder.query<DemandAnalyticsItem[], void>({
      query: () => ({
        url: '/analytics/demand',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<DemandAnalyticsItem[]>) => response.data,
      providesTags: ['Analytics'],
    }),
  }),
})

export const {
  useGetOverviewAnalyticsQuery,
  useGetDriverAnalyticsQuery,
  useGetPassengerAnalyticsQuery,
  useGetRevenueAnalyticsQuery,
  useGetDemandAnalyticsQuery,
} = analyticsApi
