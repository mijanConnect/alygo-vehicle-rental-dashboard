import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  ActivityItem,
  ChartPoint,
  ComplianceDocument,
  DemandZone,
  Driver,
  EligibilityRule,
  KpiMetric,
  NotificationItem,
  OperationalEvent,
  PaginatedResponse,
  Passenger,
  Reservation,
  SurgeZone,
  Trip,
} from '@/types'
import { buildTripDetail } from '@/services/mock/tripDetailData'
import type { TripDetail } from '@/types/tripOperations'
import {
  mockActivities,
  mockCategoryUsage,
  mockComplianceDocs,
  mockDemandTrend,
  mockDemandZones,
  mockDrivers,
  mockEligibilityRules,
  mockGrowthTrend,
  mockKpis,
  mockNotifications,
  mockOperationalEvents,
  mockPassengers,
  mockReservations,
  mockRevenueTrend,
  mockSurgeZones,
  mockTopAirports,
  mockTopCities,
  mockTrips,
} from '@/services/mock/data'

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

export const api = createApi({
  reducerPath: 'alygoApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    'Dashboard',
    'Drivers',
    'Passengers',
    'Trips',
    'Compliance',
    'Eligibility',
    'Pricing',
    'Reservations',
    'Notifications',
    'DemandIntelligence',
  ],
  endpoints: (builder) => ({
    getDashboardKpis: builder.query<KpiMetric[], void>({
      queryFn: async () => {
        await delay()
        return { data: mockKpis }
      },
      providesTags: ['Dashboard'],
    }),
    getRevenueTrend: builder.query<ChartPoint[], void>({
      queryFn: async () => ({ data: mockRevenueTrend }),
    }),
    getDemandTrend: builder.query<ChartPoint[], void>({
      queryFn: async () => ({ data: mockDemandTrend }),
    }),
    getGrowthTrend: builder.query<ChartPoint[], void>({
      queryFn: async () => ({ data: mockGrowthTrend }),
    }),
    getCategoryUsage: builder.query<ChartPoint[], void>({
      queryFn: async () => ({ data: mockCategoryUsage }),
    }),
    getTopCities: builder.query<ChartPoint[], void>({
      queryFn: async () => ({ data: mockTopCities }),
    }),
    getTopAirports: builder.query<ChartPoint[], void>({
      queryFn: async () => ({ data: mockTopAirports }),
    }),
    getActivities: builder.query<ActivityItem[], void>({
      queryFn: async () => ({ data: mockActivities }),
      providesTags: ['Dashboard'],
    }),
    getDrivers: builder.query<PaginatedResponse<Driver>, { page?: number; pageSize?: number; search?: string }>({
      queryFn: async ({ page = 1, pageSize = 10, search = '' }) => {
        await delay()
        const filtered = mockDrivers.filter(
          (d) =>
            d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.id.toLowerCase().includes(search.toLowerCase()),
        )
        const start = (page - 1) * pageSize
        return {
          data: {
            data: filtered.slice(start, start + pageSize),
            total: filtered.length,
            page,
            pageSize,
          },
        }
      },
      providesTags: ['Drivers'],
    }),
    getDriverById: builder.query<Driver | undefined, string>({
      queryFn: async (id) => {
        await delay()
        return { data: mockDrivers.find((d) => d.id === id) }
      },
      providesTags: ['Drivers'],
    }),
    getPassengers: builder.query<PaginatedResponse<Passenger>, { page?: number; pageSize?: number; search?: string }>({
      queryFn: async ({ page = 1, pageSize = 10, search = '' }) => {
        await delay()
        const filtered = mockPassengers.filter(
          (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.id.toLowerCase().includes(search.toLowerCase()),
        )
        const start = (page - 1) * pageSize
        return {
          data: {
            data: filtered.slice(start, start + pageSize),
            total: filtered.length,
            page,
            pageSize,
          },
        }
      },
      providesTags: ['Passengers'],
    }),
    getPassengerById: builder.query<Passenger | undefined, string>({
      queryFn: async (id) => ({ data: mockPassengers.find((p) => p.id === id) }),
      providesTags: ['Passengers'],
    }),
    getTrips: builder.query<Trip[], { status?: string } | void>({
      queryFn: async (params) => {
        await delay()
        const status = params?.status
        const data = status ? mockTrips.filter((t) => t.status === status) : mockTrips
        return { data }
      },
      providesTags: ['Trips'],
    }),
    getTripById: builder.query<TripDetail | undefined, string>({
      queryFn: async (id) => {
        await delay()
        return { data: buildTripDetail(id) }
      },
      providesTags: ['Trips'],
    }),
    getComplianceDocuments: builder.query<ComplianceDocument[], void>({
      queryFn: async () => ({ data: mockComplianceDocs }),
      providesTags: ['Compliance'],
    }),
    getEligibilityRules: builder.query<EligibilityRule[], void>({
      queryFn: async () => ({ data: mockEligibilityRules }),
      providesTags: ['Eligibility'],
    }),
    getSurgeZones: builder.query<SurgeZone[], void>({
      queryFn: async () => ({ data: mockSurgeZones }),
      providesTags: ['Pricing'],
    }),
    getReservations: builder.query<Reservation[], { type?: string } | void>({
      queryFn: async (params) => {
        const type = params?.type
        const data = type ? mockReservations.filter((r) => r.type === type) : mockReservations
        return { data }
      },
      providesTags: ['Reservations'],
    }),
    getNotifications: builder.query<NotificationItem[], void>({
      queryFn: async () => ({ data: mockNotifications }),
      providesTags: ['Notifications'],
    }),
    getDemandZones: builder.query<DemandZone[], void>({
      queryFn: async () => {
        await delay()
        return { data: mockDemandZones }
      },
      providesTags: ['DemandIntelligence'],
    }),
    getOperationalEvents: builder.query<OperationalEvent[], void>({
      queryFn: async () => {
        await delay()
        return { data: mockOperationalEvents }
      },
      providesTags: ['DemandIntelligence'],
    }),
    executeAdminAction: builder.mutation<
      { success: boolean; message: string },
      { action: string; entityType: string; entityId?: string; notes?: string }
    >({
      queryFn: async ({ action, entityType, entityId, notes }) => {
        await delay(300)
        return {
          data: {
            success: true,
            message: `${action} completed for ${entityType}${entityId ? ` (${entityId})` : ''}${notes ? '' : ''}`,
          },
        }
      },
      invalidatesTags: (_result, _error, { entityType }) => {
        switch (entityType) {
          case 'driver':
            return ['Drivers']
          case 'passenger':
            return ['Passengers']
          case 'trip':
            return ['Trips']
          case 'document':
            return ['Compliance']
          case 'reservation':
            return ['Reservations']
          case 'surge':
            return ['Pricing']
          default:
            return []
        }
      },
    }),
  }),
})

export const {
  useGetDashboardKpisQuery,
  useGetRevenueTrendQuery,
  useGetDemandTrendQuery,
  useGetGrowthTrendQuery,
  useGetCategoryUsageQuery,
  useGetTopCitiesQuery,
  useGetTopAirportsQuery,
  useGetActivitiesQuery,
  useGetDriversQuery,
  useGetDriverByIdQuery,
  useGetPassengersQuery,
  useGetPassengerByIdQuery,
  useGetTripsQuery,
  useGetTripByIdQuery,
  useGetComplianceDocumentsQuery,
  useGetEligibilityRulesQuery,
  useGetSurgeZonesQuery,
  useGetReservationsQuery,
  useGetNotificationsQuery,
  useGetDemandZonesQuery,
  useGetOperationalEventsQuery,
  useExecuteAdminActionMutation,
} = api
