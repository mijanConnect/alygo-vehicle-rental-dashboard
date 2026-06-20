import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  StateActivationAuditLog,
  StateActivationOverview,
  StateActivationRecord,
  StateActivationSettings,
  StateActivationStatus,
} from '@/types/stateActivation'
import {
  appendStateAuditLog,
  computeStateActivationOverview,
  logSettingsChanges,
  mockStateActivationAuditLogs,
  mockStateActivations,
  settingsFromRecord,
  STATUS_LABELS,
} from '@/services/mock/stateActivationData'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const stateActivationApi = createApi({
  reducerPath: 'stateActivationApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['StateActivations', 'StateActivationOverview', 'StateActivationAuditLogs'],
  endpoints: (builder) => ({
    getStateActivationOverview: builder.query<StateActivationOverview, void>({
      queryFn: async () => {
        await delay()
        return { data: computeStateActivationOverview() }
      },
      providesTags: ['StateActivationOverview'],
    }),
    getStateActivations: builder.query<StateActivationRecord[], void>({
      queryFn: async () => ({ data: [...mockStateActivations] }),
      providesTags: ['StateActivations'],
    }),
    getStateActivationById: builder.query<StateActivationRecord | undefined, string>({
      queryFn: async (id) => {
        await delay()
        return { data: mockStateActivations.find((s) => s.id === id) }
      },
      providesTags: ['StateActivations'],
    }),
    getStateActivationAuditLogs: builder.query<StateActivationAuditLog[], void>({
      queryFn: async () => ({ data: [...mockStateActivationAuditLogs] }),
      providesTags: ['StateActivationAuditLogs'],
    }),
    updateStateActivation: builder.mutation<
      StateActivationRecord,
      { id: string; settings: Partial<StateActivationSettings>; changedBy?: string }
    >({
      queryFn: async ({ id, settings, changedBy = 'Admin' }) => {
        await delay()
        const index = mockStateActivations.findIndex((s) => s.id === id)
        if (index === -1) return { error: { status: 404, data: 'State not found' } }
        const before = settingsFromRecord(mockStateActivations[index])
        mockStateActivations[index] = {
          ...mockStateActivations[index],
          ...settings,
          lastUpdated: new Date().toISOString(),
          updatedBy: changedBy,
        }
        logSettingsChanges(id, mockStateActivations[index].stateName, before, settingsFromRecord(mockStateActivations[index]), changedBy)
        return { data: mockStateActivations[index] }
      },
      invalidatesTags: ['StateActivations', 'StateActivationOverview', 'StateActivationAuditLogs'],
    }),
    setStateStatus: builder.mutation<
      StateActivationRecord,
      { id: string; status: StateActivationStatus; changedBy?: string }
    >({
      queryFn: async ({ id, status, changedBy = 'Admin' }) => {
        await delay()
        const index = mockStateActivations.findIndex((s) => s.id === id)
        if (index === -1) return { error: { status: 404, data: 'State not found' } }
        const prev = STATUS_LABELS[mockStateActivations[index].status]
        mockStateActivations[index] = {
          ...mockStateActivations[index],
          status,
          platformActive: status === 'active',
          lastUpdated: new Date().toISOString(),
          updatedBy: changedBy,
        }
        if (status === 'disabled') {
          mockStateActivations[index] = {
            ...mockStateActivations[index],
            driverRegistrationEnabled: false,
            passengerRegistrationEnabled: false,
            reservationsEnabled: false,
            airportQueueEnabled: false,
            dynamicPricingEnabled: false,
          }
        }
        appendStateAuditLog(id, mockStateActivations[index].stateName, 'Status', prev, STATUS_LABELS[status], changedBy)
        return { data: mockStateActivations[index] }
      },
      invalidatesTags: ['StateActivations', 'StateActivationOverview', 'StateActivationAuditLogs'],
    }),
  }),
})

export const {
  useGetStateActivationOverviewQuery,
  useGetStateActivationsQuery,
  useGetStateActivationByIdQuery,
  useGetStateActivationAuditLogsQuery,
  useUpdateStateActivationMutation,
  useSetStateStatusMutation,
} = stateActivationApi

export { STATUS_LABELS }
