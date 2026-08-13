import { baseApi } from '@/redux/baseApi'
import type { Reservation } from '@/types'
import { cleanObject } from '@/utils/cleanObject'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPage: number
    statistics?: {
      totalReservations: number
      scheduledReservations: number
      airportReservations: number
      eventReservations: number
      pendingAssignments: number
      completedReservations: number
    }
  }
}

export interface ReservationsResponse {
  data: Reservation[]
  statistics: {
    totalReservations: number
    scheduledReservations: number
    airportReservations: number
    eventReservations: number
    pendingAssignments: number
    completedReservations: number
  }
  meta?: {
    page: number
    limit: number
    total: number
    totalPage: number
  }
}

export const reservationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReservationsList: builder.query<ReservationsResponse, { page?: number; limit?: number; type?: string; status?: string; search?: string } | void>({
      query: (params) => ({
        url: '/admin/reservations',
        method: 'GET',
        params: params ? cleanObject(params) : undefined,
      }),
      transformResponse: (response: ApiResponse<any[]>) => {
        const mapCategory = (category: string | undefined): any => {
          if (!category) return 'standard'
          const cat = category.toLowerCase()
          if (cat.includes('standard')) return 'standard'
          if (cat.includes('comfort')) return 'comfort'
          if (cat.includes('xl')) return 'xl'
          if (cat.includes('pet')) return 'pet'
          if (cat.includes('priority')) return 'priority'
          if (cat.includes('black_suv') || (cat.includes('black') && cat.includes('suv'))) return 'black_suv'
          if (cat.includes('black')) return 'black'
          return 'standard'
        }

        const mappedData: Reservation[] = (response.data ?? []).map((item) => ({
          id: item.reservationId,
          type: item.reservationType,
          passengerName: item.passenger?.name ?? '—',
          pickup: item.pickup,
          dropoff: item.dropoff,
          scheduledAt: item.scheduledTime,
          createdAt: item.createdAt,
          category: mapCategory(item.category),
          status: item.status,
          driverName: item.assignedDriver?.name,
          city: item.city,
          airportCode: item.airportCode,
          flightNumber: item.flightNumber,
          terminal: item.terminal,
          eventName: item.eventName,
          venue: item.venue,
          eventTime: item.eventTime,
        }))

        return {
          data: mappedData,
          statistics: response.meta?.statistics ?? {
            totalReservations: 0,
            scheduledReservations: 0,
            airportReservations: 0,
            eventReservations: 0,
            pendingAssignments: 0,
            completedReservations: 0,
          },
          meta: response.meta ? {
            page: response.meta.page,
            limit: response.meta.limit,
            total: response.meta.total,
            totalPage: response.meta.totalPage,
          } : undefined,
        }
      },
      providesTags: ['Reservations'],
    }),
  }),
})

export const { useGetReservationsListQuery } = reservationsApi
