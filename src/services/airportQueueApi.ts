import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  AirportQueueOverview,
  AirportQueueRules,
  AirportQueueStatus,
  AirportRecord,
  QueueDriver,
} from '@/types/airportQueue'
import {
  computeAirportQueueOverview,
  mockAirports,
  mockQueueDrivers,
  mockQueueRules,
} from '@/services/mock/airportQueueData'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const airportQueueApi = createApi({
  reducerPath: 'airportQueueApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['AirportOverview', 'Airports', 'QueueRules', 'QueueDrivers'],
  endpoints: (builder) => ({
    getAirportQueueOverview: builder.query<AirportQueueOverview, void>({
      queryFn: async () => {
        await delay()
        return { data: computeAirportQueueOverview() }
      },
      providesTags: ['AirportOverview'],
    }),
    getAirports: builder.query<AirportRecord[], void>({
      queryFn: async () => ({ data: [...mockAirports] }),
      providesTags: ['Airports'],
    }),
    updateAirport: builder.mutation<AirportRecord, Partial<AirportRecord> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockAirports.findIndex((a) => a.id === id)
        if (index === -1) return { error: { status: 404, data: 'Airport not found' } }
        mockAirports[index] = { ...mockAirports[index], ...updates }
        return { data: mockAirports[index] }
      },
      invalidatesTags: ['Airports', 'AirportOverview'],
    }),
    setAirportStatus: builder.mutation<AirportRecord, { id: string; status: AirportQueueStatus }>({
      queryFn: async ({ id, status }) => {
        await delay()
        const index = mockAirports.findIndex((a) => a.id === id)
        if (index === -1) return { error: { status: 404, data: 'Airport not found' } }
        mockAirports[index] = {
          ...mockAirports[index],
          status,
          queueSize: status === 'disabled' ? 0 : mockAirports[index].queueSize,
          averageWaitMinutes: status === 'disabled' ? 0 : mockAirports[index].averageWaitMinutes,
        }
        if (status === 'disabled') {
          for (let i = mockQueueDrivers.length - 1; i >= 0; i--) {
            if (mockQueueDrivers[i].airportId === id) mockQueueDrivers.splice(i, 1)
          }
        }
        return { data: mockAirports[index] }
      },
      invalidatesTags: ['Airports', 'AirportOverview', 'QueueDrivers'],
    }),
    getQueueRules: builder.query<AirportQueueRules, void>({
      queryFn: async () => ({ data: { ...mockQueueRules } }),
      providesTags: ['QueueRules'],
    }),
    updateQueueRules: builder.mutation<AirportQueueRules, Partial<AirportQueueRules>>({
      queryFn: async (updates) => {
        await delay()
        Object.assign(mockQueueRules, updates)
        return { data: { ...mockQueueRules } }
      },
      invalidatesTags: ['QueueRules'],
    }),
    getQueueDrivers: builder.query<QueueDriver[], string | void>({
      queryFn: async (airportId) => {
        await delay()
        const data = airportId
          ? mockQueueDrivers.filter((d) => d.airportId === airportId).sort((a, b) => a.position - b.position)
          : [...mockQueueDrivers].sort((a, b) => a.position - b.position)
        return { data }
      },
      providesTags: ['QueueDrivers'],
    }),
  }),
})

export const {
  useGetAirportQueueOverviewQuery,
  useGetAirportsQuery,
  useUpdateAirportMutation,
  useSetAirportStatusMutation,
  useGetQueueRulesQuery,
  useUpdateQueueRulesMutation,
  useGetQueueDriversQuery,
} = airportQueueApi

export const AIRPORT_STATUS_LABELS: Record<AirportQueueStatus, string> = {
  active: 'Active',
  disabled: 'Disabled',
}
