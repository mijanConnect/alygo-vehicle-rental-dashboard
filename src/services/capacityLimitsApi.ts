import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type { CapacityLimit } from '@/types/capacityLimits'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

const MOCK_CAPACITY_LIMITS: CapacityLimit[] = [
  {
    id: 'lmt-1',
    locationId: 'ca',
    locationName: 'California',
    locationType: 'state',
    maxActiveDrivers: 15000,
    maxNewApprovals: 500,
    onboardingPaused: false,
    currentActiveDrivers: 12400,
    currentWaitlistSize: 0,
    notifyAt80: true,
    notifyAt90: true,
    notifyAt100: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'System',
  },
  {
    id: 'lmt-2',
    locationId: 'sf',
    locationName: 'San Francisco',
    locationType: 'city',
    maxActiveDrivers: 5000,
    maxNewApprovals: 100,
    onboardingPaused: false,
    currentActiveDrivers: 4850,
    currentWaitlistSize: 120,
    notifyAt80: true,
    notifyAt90: true,
    notifyAt100: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'System',
  },
  {
    id: 'lmt-3',
    locationId: 'sf-dt',
    locationName: 'Downtown SF',
    locationType: 'zone',
    maxActiveDrivers: 1000,
    maxNewApprovals: 0,
    onboardingPaused: true,
    currentActiveDrivers: 980,
    currentWaitlistSize: 45,
    minDriverSupply: 200,
    maxDriverSupply: 1000,
    autoWaitingQueue: true,
    autoMoveFromWaitlist: true,
    notifyAt80: true,
    notifyAt90: true,
    notifyAt100: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'System',
  },
  {
    id: 'lmt-4',
    locationId: 'sfo',
    locationName: 'SFO Airport',
    locationType: 'airport',
    maxActiveDrivers: 500,
    maxNewApprovals: 0,
    onboardingPaused: false,
    currentActiveDrivers: 480,
    currentWaitlistSize: 0,
    maxAirportQueueSize: 250,
    autoWaitingQueue: true,
    autoMoveFromWaitlist: true,
    notifyAt80: true,
    notifyAt90: true,
    notifyAt100: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'System',
  },
]

export const capacityLimitsApi = createApi({
  reducerPath: 'capacityLimitsApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['CapacityLimits'],
  endpoints: (builder) => ({
    getCapacityLimits: builder.query<CapacityLimit[], void>({
      queryFn: async () => {
        await delay()
        return { data: [...MOCK_CAPACITY_LIMITS] }
      },
      providesTags: ['CapacityLimits'],
    }),
    updateCapacityLimit: builder.mutation<
      CapacityLimit,
      { id: string; settings: Partial<CapacityLimit>; changedBy?: string }
    >({
      queryFn: async ({ id, settings, changedBy = 'Admin' }) => {
        await delay()
        const index = MOCK_CAPACITY_LIMITS.findIndex((l) => l.id === id)
        if (index === -1) return { error: { status: 404, data: 'Limit not found' } }
        
        MOCK_CAPACITY_LIMITS[index] = {
          ...MOCK_CAPACITY_LIMITS[index],
          ...settings,
          lastUpdated: new Date().toISOString(),
          updatedBy: changedBy,
        }
        return { data: MOCK_CAPACITY_LIMITS[index] }
      },
      invalidatesTags: ['CapacityLimits'],
    }),
  }),
})

export const { useGetCapacityLimitsQuery, useUpdateCapacityLimitMutation } = capacityLimitsApi
