import { baseApi } from '@/redux/baseApi'
import { cleanObject } from '@/utils/cleanObject'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: LiveTripMeta
}

export interface LiveTripMeta {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface LiveTripPerson {
  _id?: string
  name: string
}

export interface LiveTrip {
  _id: string
  status: string
  createdAt: string
  passenger: LiveTripPerson
  driver: LiveTripPerson
  category: string
  pickup: string
  dropoff: string
  city: string
  fare: number
}

export interface LiveTripListResult {
  data: LiveTrip[]
  meta: LiveTripMeta
}

export interface GetLiveTripsParams {
  page?: number
  limit?: number
  searchTerm?: string
}

export interface LiveTripLocationPoint {
  address: string
  latitude: number
  longitude: number
}

export interface LiveTripStop extends LiveTripLocationPoint {
  sequence: number
}

export interface LiveTripDetailRide {
  rideId: string
  bookingReference: string
  status: string
  rideCategory: string
  city: string
  estimatedDistance: number
  estimatedDuration: number
  createdAt: string
  acceptedAt: string | null
  startedAt: string | null
  completedAt: string | null
}

export interface LiveTripDetailPerson {
  id: string
  fullName: string
  phone: string
  email: string
  avatar?: string | null
  overallRating?: number
  passengerStatus?: string
  driverStatus?: string
  vehicle?: string | null
}

export interface LiveTripLiveTracking {
  currentDriverLocation: { latitude: number; longitude: number } | null
  heading: number
  speed: number
  lastUpdated: string
  routePolyline: string
  ETA: number
  routeProgressPercentage: number
}

export interface LiveTripFareSummary {
  baseFare: number
  distanceFare: number
  durationFare: number
  surgeFare: number
  waitingCharge: number
  tollCharge: number
  platformFee: number
  discount: number
  totalFare: number
  paymentMethod: string | null
  paymentStatus: string
}

export interface LiveTripTimelineItem {
  status: string
  title: string
  timestamp: string
}

export interface LiveTripCancellation {
  cancelled: boolean
  cancelledBy: string
  reason: string
  description: string
  cancelledAt: string
}

export interface LiveTripSafetyEvent {
  id?: string
  type?: string
  description?: string
  timestamp?: string
  status?: string
}

export interface LiveTripMapInformation {
  driverLocation: { latitude: number; longitude: number } | null
  pickup: LiveTripLocationPoint
  dropoff: LiveTripLocationPoint
  polyline: string
  ETA: number
  routeProgress: number
}

export interface LiveTripDetail {
  ride: LiveTripDetailRide
  driver: LiveTripDetailPerson | null
  passenger: LiveTripDetailPerson | null
  pickup: LiveTripLocationPoint
  dropoff: LiveTripLocationPoint
  stops: LiveTripStop[]
  liveTracking: LiveTripLiveTracking
  fareSummary: LiveTripFareSummary
  timeline: LiveTripTimelineItem[]
  cancellation: LiveTripCancellation | null
  safetyEvents: LiveTripSafetyEvent[]
  mapInformation: LiveTripMapInformation
}

export const liveTripApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLiveTrips: builder.query<LiveTripListResult, GetLiveTripsParams | void>({
      query: ({ page = 1, limit = 10, searchTerm } = {}) => ({
        url: '/live-trips',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
        }),
      }),
      transformResponse: (response: ApiResponse<LiveTrip[]>) => ({
        data: response.data ?? [],
        meta: response.meta ?? {
          page: 1,
          limit: 10,
          totalItems: response.data?.length ?? 0,
          totalPages: 1,
        },
      }),
      providesTags: ['LiveTrip'],
    }),

    getSingleLiveTrip: builder.query<LiveTripDetail, string>({
      query: (rideId) => ({
        url: `/live-trips/${rideId}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<LiveTripDetail>) => response.data,
      providesTags: (_res, _err, id) => [{ type: 'LiveTrip', id }],
    }),
  }),
})

export const { useGetLiveTripsQuery, useGetSingleLiveTripQuery } = liveTripApi
