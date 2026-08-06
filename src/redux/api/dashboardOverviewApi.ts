import { baseApi } from '@/redux/baseApi'
import type { ChartPoint, KpiMetric } from '@/types'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface DashboardSummary {
  totalDrivers: number
  totalPassengers: number
  activeTrips: number
  revenueToday: number
  revenueThisMonth: number
  totalRevenue: number
  driverApprovalQueue: number
  airportQueueCount: number
  scheduledRides: number
}

interface RevenueDayPoint {
  day: string
  revenue: number
}

interface DemandPoint {
  time: string
  demand: number
}

interface DriverGrowthPoint {
  month: string
  drivers: number
}

interface PassengerGrowthPoint {
  month: string
  passengers: number
}

interface CategoryUsagePoint {
  id: string
  name: string
  totalTrips: number
  percentage: number
}

interface TopCityPoint {
  city: string
  revenue: number
}

interface TopAirportPoint {
  airport: string
  trips: number
}

function mapSummaryToKpis(summary: DashboardSummary): KpiMetric[] {
  return [
    {
      key: 'totalDrivers',
      label: 'Total Drivers',
      value: summary.totalDrivers,
      change: 0,
      format: 'number',
      icon: 'users',
    },
    {
      key: 'totalPassengers',
      label: 'Total Passengers',
      value: summary.totalPassengers,
      change: 0,
      format: 'number',
      icon: 'user-check',
    },
    {
      key: 'activeTrips',
      label: 'Active Trips',
      value: summary.activeTrips,
      change: 0,
      format: 'number',
      icon: 'car',
    },
    {
      key: 'revenueToday',
      label: 'Revenue Today',
      value: summary.revenueToday,
      change: 0,
      format: 'currency',
      icon: 'dollar-sign',
    },
    {
      key: 'revenueMonth',
      label: 'Revenue This Month',
      value: summary.revenueThisMonth,
      change: 0,
      format: 'currency',
      icon: 'trending-up',
    },
    {
      key: 'totalRevenue',
      label: 'Total Revenue',
      value: summary.totalRevenue,
      change: 0,
      format: 'currency',
      icon: 'dollar-sign',
    },
    {
      key: 'approvalQueue',
      label: 'Driver Approval Queue',
      value: summary.driverApprovalQueue,
      change: 0,
      format: 'number',
      icon: 'clipboard-check',
    },
    {
      key: 'airportQueue',
      label: 'Airport Queue Count',
      value: summary.airportQueueCount,
      change: 0,
      format: 'number',
      icon: 'plane',
    },
    {
      key: 'scheduledRides',
      label: 'Scheduled Rides',
      value: summary.scheduledRides,
      change: 0,
      format: 'number',
      icon: 'calendar',
    },
  ]
}

export const dashboardOverviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<KpiMetric[], void>({
      query: () => ({
        url: '/admin/dashboard/summary',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<DashboardSummary>) =>
        mapSummaryToKpis(response.data),
      providesTags: ['Overview'],
    }),
    getDashboardRevenueChart: builder.query<ChartPoint[], void>({
      query: () => ({
        url: '/admin/dashboard/revenue-chart',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<RevenueDayPoint[]>) =>
        response.data.map((point) => ({
          label: point.day,
          value: point.revenue,
        })),
      providesTags: ['Overview'],
    }),
    getDashboardDemandChart: builder.query<ChartPoint[], void>({
      query: () => ({
        url: '/admin/dashboard/demand-chart',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<DemandPoint[]>) =>
        response.data.map((point) => ({
          label: point.time,
          value: point.demand,
        })),
      providesTags: ['Overview'],
    }),
    getDashboardDriverGrowth: builder.query<ChartPoint[], void>({
      query: () => ({
        url: '/admin/dashboard/driver-growth',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<DriverGrowthPoint[]>) =>
        response.data.map((point) => ({
          label: point.month,
          value: point.drivers,
        })),
      providesTags: ['Overview'],
    }),
    getDashboardPassengerGrowth: builder.query<ChartPoint[], void>({
      query: () => ({
        url: '/admin/dashboard/passenger-growth',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<PassengerGrowthPoint[]>) =>
        response.data.map((point) => ({
          label: point.month,
          value: point.passengers,
        })),
      providesTags: ['Overview'],
    }),
    getDashboardCategoryUsage: builder.query<ChartPoint[], void>({
      query: () => ({
        url: '/admin/dashboard/category-usage',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<CategoryUsagePoint[]>) =>
        response.data.map((point) => ({
          label: point.name,
          value: point.percentage,
        })),
      providesTags: ['Overview'],
    }),
    getDashboardTopCities: builder.query<ChartPoint[], void>({
      query: () => ({
        url: '/admin/dashboard/top-cities',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<TopCityPoint[]>) =>
        response.data.map((point) => ({
          label: point.city,
          value: point.revenue,
        })),
      providesTags: ['Overview'],
    }),
    getDashboardTopAirports: builder.query<ChartPoint[], void>({
      query: () => ({
        url: '/admin/dashboard/top-airports',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<TopAirportPoint[]>) =>
        response.data.map((point) => ({
          label: point.airport,
          value: point.trips,
        })),
      providesTags: ['Overview'],
    }),
  }),
})

export const {
  useGetDashboardSummaryQuery,
  useGetDashboardRevenueChartQuery,
  useGetDashboardDemandChartQuery,
  useGetDashboardDriverGrowthQuery,
  useGetDashboardPassengerGrowthQuery,
  useGetDashboardCategoryUsageQuery,
  useGetDashboardTopCitiesQuery,
  useGetDashboardTopAirportsQuery,
} = dashboardOverviewApi
