import { baseApi } from '@/redux/baseApi'
import type { ChartPoint } from '@/types'
import { cleanObject } from '@/utils/cleanObject'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages?: number
    totalPage?: number
  }
}

export interface TripCompletionComplaintStats {
  totalComplaints: number
  pendingReview: number
  underInvestigation: number
  approvedRefunds: number
  rejected: number
}

export type TripComplaintAdminStatus = 'open' | 'investigating' | 'resolved'

interface ComplaintTrendPoint {
  month: string
  complaints: number
}

export interface TripComplaintPerson {
  id: string
  name: string
  email?: string
  phone?: string
  profileImage?: string
}

export interface TripComplaintListApiItem {
  complaintId: string
  rideId: string
  passenger: TripComplaintPerson | null
  driver: TripComplaintPerson | null
  complaintType: string
  distanceDeltaMeters: number
  fare: number
  reportedAt: string
  status: string
}

export interface TripComplaintRow {
  id: string
  complaintId: string
  rideId: string
  passengerId: string
  passengerName: string
  driverId: string
  driverName: string
  complaintType: string
  distanceDeltaMeters: number
  fare: number
  reportedAt: string
  status: string
}

export interface TripComplaintListResult {
  data: TripComplaintRow[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface GetTripComplaintsParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: string
}

export interface TripComplaintDetail {
  complaint: {
    id: string
    ticketId: string
    providedSummaryDetails: string
    estimatedResponseTimeInMinutes: number
    status: string
    createdAt: string
    updatedAt: string
  }
  ride: {
    id?: string
    pickup?: string
    dropoff?: string
    durationMinutes?: number
    mileage?: number
  } | null
  passenger: TripComplaintPerson | null
  driver: TripComplaintPerson | null
  gpsSummary: {
    estimatedDistanceMeters: number
    actualDistanceMeters: number
    distanceDeltaMeters: number
    pickupCoords: { lat: number; lng: number } | null
    dropoffCoords: { lat: number; lng: number } | null
    actualRoutePolyline: string | null
  }
  fareBreakdown: {
    baseFare: number
    distanceFare: number
    timeFare: number
    subtotal: number
    commission: number
    driverEarning: number
    total: number
  }
  refund: {
    amount?: number
    status?: string
  } | null
  timeline: Array<{
    event: string
    timestamp: string
    actor: string
    details?: Record<string, unknown>
  }>
  adminNotes: Array<{
    note?: string
    admin?: string
    createdAt?: string
    timestamp?: string
  }>
}

export interface UpdateTripComplaintBody {
  complaintId: string
  status: TripComplaintAdminStatus
  adminNote: string
}

function mapComplaintRow(item: TripComplaintListApiItem): TripComplaintRow {
  return {
    id: item.complaintId,
    complaintId: item.complaintId,
    rideId: item.rideId ?? '',
    passengerId: item.passenger?.id ?? '',
    passengerName: item.passenger?.name?.trim() || '—',
    driverId: item.driver?.id ?? '',
    driverName: item.driver?.name?.trim() || '—',
    complaintType: item.complaintType ?? '—',
    distanceDeltaMeters: item.distanceDeltaMeters ?? 0,
    fare: item.fare ?? 0,
    reportedAt: item.reportedAt,
    status: item.status,
  }
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

    getAllTripReports: builder.query<
      TripComplaintListResult,
      GetTripComplaintsParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/admin/trip-completion-complaints',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: ApiResponse<TripComplaintListApiItem[]>) => {
        const rows = (response.data ?? []).map(mapComplaintRow)
        const pagination = response.pagination

        return {
          data: rows,
          meta: {
            page: pagination?.page ?? 1,
            limit: pagination?.limit ?? 10,
            totalItems: pagination?.total ?? rows.length,
            totalPages: pagination?.totalPages ?? pagination?.totalPage ?? 1,
          },
        }
      },
      providesTags: ['TripCompletionComplaints'],
    }),

    getSingleTripReport: builder.query<TripComplaintDetail, string>({
      query: (complaintId) => ({
        url: `/admin/trip-completion-complaints/${complaintId}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<TripComplaintDetail>) => response.data,
      providesTags: (_result, _error, complaintId) => [
        { type: 'TripCompletionComplaints', id: complaintId },
      ],
    }),

    updateAdminTripCompletionComplaint: builder.mutation<void, UpdateTripComplaintBody>({
      query: ({ complaintId, status, adminNote }) => ({
        url: `/admin/trip-completion-complaints/status/${complaintId}`,
        method: 'PATCH',
        body: { status, adminNote },
      }),
      invalidatesTags: ['TripCompletionComplaints', 'TripCompletionComplaintStats'],
    }),
  }),
})

export const {
  useGetTripReportsAnalyticsStatsQuery,
  useGetTripReportsAnalyticsReportsTrendQuery,
  useGetAllTripReportsQuery,
  useGetSingleTripReportQuery,
  useUpdateAdminTripCompletionComplaintMutation,
} = tripReportApi
