import { baseApi } from '@/redux/baseApi'
import type { ChartPoint } from '@/types'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface TripCompletionComplaintStats {
  totalComplaints: number
  pendingReview: number
  underInvestigation: number
  approvedRefunds: number
  rejected: number
}

interface ComplaintTrendPoint {
  month: string
  complaints: number
}

export const tripReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTripReportsAnalyticsStats: builder.query<TripCompletionComplaintStats, void>({
      query: () => ({
        url: '/admin/trip-completion-complaints/dashboard/cards',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<TripCompletionComplaintStats>) =>
        response.data,
      providesTags: ['TripCompletionComplaintStats'],
    }),

    getTripReportsAnalyticsReportsTrend: builder.query<ChartPoint[], void>({
      query: () => ({
        url: '/admin/trip-completion-complaints/analytics/trend',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<ComplaintTrendPoint[]>) =>
        (response.data ?? []).map((point) => ({
          label: point.month,
          value: point.complaints,
        })),
      providesTags: ['TripCompletionComplaintStats'],
    }),
  }),
})

export const {
  useGetTripReportsAnalyticsStatsQuery,
  useGetTripReportsAnalyticsReportsTrendQuery,
} = tripReportApi
