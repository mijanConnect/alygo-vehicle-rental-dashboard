import { baseApi } from '@/redux/baseApi'

export interface DemandSummary {
  activeRequests: number
  availableDrivers: number
  highDemandZones: number
  activeSurgeZones: number
  upcomingEvents: number
  averageEtaMinutes: number
}

export interface DemandZone {
  id: string
  zone: string
  activeRequests: number
  availableDrivers: number
  demandRatio: number | null
  averageEtaMinutes: number
  status: 'normal' | 'medium_demand' | 'high_demand'
}

export interface UpcomingEvent {
  id: string
  eventName: string
  location: string
  date: string
  status: string
  relatedReservations: number
}

export interface LiveMapDriver {
  driverId: string
  driverName: string
  longitude: number
  latitude: number
  status: string
}

export interface LiveMapData {
  availableDriverCount: number
  surgeZoneCount: number
  reservationCount: number
  airportCount: number
  drivers: LiveMapDriver[]
}

export const demandIntelligenceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDemandSummary: builder.query<DemandSummary, void>({
      query: () => ({
        url: '/demand-intelligence/summary',
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ['Analytics'],
    }),

    getDemandZonesList: builder.query<DemandZone[], void>({
      query: () => ({
        url: '/demand-intelligence/zones',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        return (response.data ?? []).map((z: any) => ({
          id: z.zoneId ?? z.id,
          zone: z.zone,
          activeRequests: z.activeRequests ?? 0,
          availableDrivers: z.availableDrivers ?? 0,
          demandRatio: typeof z.demandRatio === 'number' ? z.demandRatio : (z.availableDrivers > 0 ? z.activeRequests / z.availableDrivers : 0),
          averageEtaMinutes: z.averageEtaMinutes ?? 0,
          status: z.status ?? 'normal',
        }))
      },
      providesTags: ['Analytics'],
    }),

    getUpcomingEventsList: builder.query<UpcomingEvent[], void>({
      query: () => ({
        url: '/demand-intelligence/upcoming-events',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        return (response.data ?? []).map((e: any) => ({
          id: e.eventId ?? e.id,
          eventName: e.eventName,
          location: e.locationName ?? (typeof e.location === 'object' ? e.locationName : e.location) ?? '—',
          date: e.startDateTime,
          status: e.status,
          relatedReservations: e.relatedReservations ?? 0,
        }))
      },
      providesTags: ['Analytics'],
    }),

    getLiveMapData: builder.query<LiveMapData, void>({
      query: () => ({
        url: '/demand-intelligence/live-map',
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ['Analytics'],
    }),
  }),
})

export const {
  useGetDemandSummaryQuery,
  useGetDemandZonesListQuery,
  useGetUpcomingEventsListQuery,
  useGetLiveMapDataQuery,
} = demandIntelligenceApi
