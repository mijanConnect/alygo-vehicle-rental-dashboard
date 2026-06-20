import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  IncidentCategory,
  IncidentCategoryFormValues,
  IncidentStatus,
  SafetyDashboardSummary,
  SafetyIncident,
  SafetyOverview,
  SafetySettings,
} from '@/types/safetyIncident'
import {
  computeSafetyDashboardSummary,
  computeSafetyOverview,
  mockIncidentCategories,
  mockSafetyIncidents,
  mockSafetySettings,
} from '@/services/mock/safetyIncidentData'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

function appendStatusChange(
  incident: SafetyIncident,
  status: IncidentStatus,
  note?: string,
): SafetyIncident {
  const timestamp = new Date().toISOString()
  return {
    ...incident,
    status,
    statusHistory: [
      ...incident.statusHistory,
      { status, timestamp, note: note ?? `Status changed to ${status}` },
    ],
  }
}

export const safetyIncidentApi = createApi({
  reducerPath: 'safetyIncidentApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['SafetyOverview', 'Incidents', 'IncidentCategories', 'SafetySettings'],
  endpoints: (builder) => ({
    getSafetyOverview: builder.query<SafetyOverview, void>({
      queryFn: async () => {
        await delay()
        return { data: computeSafetyOverview() }
      },
      providesTags: ['SafetyOverview'],
    }),
    getSafetyDashboardSummary: builder.query<SafetyDashboardSummary, void>({
      queryFn: async () => {
        await delay()
        return { data: computeSafetyDashboardSummary() }
      },
      providesTags: ['SafetyOverview', 'Incidents'],
    }),
    getIncidents: builder.query<SafetyIncident[], void>({
      queryFn: async () => ({ data: [...mockSafetyIncidents] }),
      providesTags: ['Incidents'],
    }),
    getIncidentById: builder.query<SafetyIncident | undefined, string>({
      queryFn: async (id) => {
        await delay()
        return { data: mockSafetyIncidents.find((i) => i.id === id) }
      },
      providesTags: ['Incidents'],
    }),
    addIncidentNote: builder.mutation<SafetyIncident, { id: string; content: string }>({
      queryFn: async ({ id, content }) => {
        await delay()
        const index = mockSafetyIncidents.findIndex((i) => i.id === id)
        if (index === -1) return { error: { status: 404, data: 'Incident not found' } }
        mockSafetyIncidents[index] = {
          ...mockSafetyIncidents[index],
          notes: [
            ...mockSafetyIncidents[index].notes,
            { id: `n-${Date.now()}`, author: 'Super Admin', content, timestamp: new Date().toISOString() },
          ],
        }
        return { data: mockSafetyIncidents[index] }
      },
      invalidatesTags: ['Incidents'],
    }),
    updateIncidentStatus: builder.mutation<SafetyIncident, { id: string; status: IncidentStatus; note?: string }>({
      queryFn: async ({ id, status, note }) => {
        await delay()
        const index = mockSafetyIncidents.findIndex((i) => i.id === id)
        if (index === -1) return { error: { status: 404, data: 'Incident not found' } }
        mockSafetyIncidents[index] = appendStatusChange(mockSafetyIncidents[index], status, note)
        return { data: mockSafetyIncidents[index] }
      },
      invalidatesTags: ['Incidents', 'SafetyOverview'],
    }),
    resolveIncident: builder.mutation<SafetyIncident, { id: string; note?: string }>({
      queryFn: async ({ id, note }) => {
        await delay()
        const index = mockSafetyIncidents.findIndex((i) => i.id === id)
        if (index === -1) return { error: { status: 404, data: 'Incident not found' } }
        const resolutionNotes = note ?? 'Case resolved'
        mockSafetyIncidents[index] = {
          ...appendStatusChange(mockSafetyIncidents[index], 'resolved', resolutionNotes),
          resolutionNotes,
          notes: [
            ...mockSafetyIncidents[index].notes,
            {
              id: `n-${Date.now()}`,
              author: 'Super Admin',
              content: resolutionNotes,
              timestamp: new Date().toISOString(),
            },
          ],
        }
        return { data: mockSafetyIncidents[index] }
      },
      invalidatesTags: ['Incidents', 'SafetyOverview'],
    }),
    closeIncident: builder.mutation<SafetyIncident, { id: string; note?: string }>({
      queryFn: async ({ id, note }) => {
        await delay()
        const index = mockSafetyIncidents.findIndex((i) => i.id === id)
        if (index === -1) return { error: { status: 404, data: 'Incident not found' } }
        const closingNote = note ?? 'Case closed'
        mockSafetyIncidents[index] = {
          ...appendStatusChange(mockSafetyIncidents[index], 'closed', closingNote),
          notes: [
            ...mockSafetyIncidents[index].notes,
            {
              id: `n-${Date.now()}`,
              author: 'Super Admin',
              content: closingNote,
              timestamp: new Date().toISOString(),
            },
          ],
        }
        return { data: mockSafetyIncidents[index] }
      },
      invalidatesTags: ['Incidents', 'SafetyOverview'],
    }),
    reopenIncident: builder.mutation<SafetyIncident, { id: string; note?: string }>({
      queryFn: async ({ id, note }) => {
        await delay()
        const index = mockSafetyIncidents.findIndex((i) => i.id === id)
        if (index === -1) return { error: { status: 404, data: 'Incident not found' } }
        const reopenNote = note ?? 'Case reopened'
        mockSafetyIncidents[index] = {
          ...appendStatusChange(mockSafetyIncidents[index], 'open', reopenNote),
          resolutionNotes: undefined,
          notes: [
            ...mockSafetyIncidents[index].notes,
            {
              id: `n-${Date.now()}`,
              author: 'Super Admin',
              content: reopenNote,
              timestamp: new Date().toISOString(),
            },
          ],
        }
        return { data: mockSafetyIncidents[index] }
      },
      invalidatesTags: ['Incidents', 'SafetyOverview'],
    }),
    getIncidentCategories: builder.query<IncidentCategory[], void>({
      queryFn: async () => ({ data: [...mockIncidentCategories] }),
      providesTags: ['IncidentCategories'],
    }),
    createIncidentCategory: builder.mutation<IncidentCategory, IncidentCategoryFormValues>({
      queryFn: async (values) => {
        await delay()
        const category: IncidentCategory = { id: `cat-${Date.now()}`, ...values }
        mockIncidentCategories.push(category)
        return { data: category }
      },
      invalidatesTags: ['IncidentCategories'],
    }),
    updateIncidentCategory: builder.mutation<IncidentCategory, Partial<IncidentCategory> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockIncidentCategories.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Category not found' } }
        mockIncidentCategories[index] = { ...mockIncidentCategories[index], ...updates }
        return { data: mockIncidentCategories[index] }
      },
      invalidatesTags: ['IncidentCategories'],
    }),
    deleteIncidentCategory: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockIncidentCategories.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Category not found' } }
        mockIncidentCategories.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['IncidentCategories'],
    }),
    getSafetySettings: builder.query<SafetySettings, void>({
      queryFn: async () => ({ data: { ...mockSafetySettings } }),
      providesTags: ['SafetySettings'],
    }),
    updateSafetySettings: builder.mutation<SafetySettings, Partial<SafetySettings>>({
      queryFn: async (updates) => {
        await delay()
        Object.assign(mockSafetySettings, updates)
        return { data: { ...mockSafetySettings } }
      },
      invalidatesTags: ['SafetySettings'],
    }),
  }),
})

export const {
  useGetSafetyOverviewQuery,
  useGetSafetyDashboardSummaryQuery,
  useGetIncidentsQuery,
  useGetIncidentByIdQuery,
  useAddIncidentNoteMutation,
  useUpdateIncidentStatusMutation,
  useResolveIncidentMutation,
  useCloseIncidentMutation,
  useReopenIncidentMutation,
  useGetIncidentCategoriesQuery,
  useCreateIncidentCategoryMutation,
  useUpdateIncidentCategoryMutation,
  useDeleteIncidentCategoryMutation,
  useGetSafetySettingsQuery,
  useUpdateSafetySettingsMutation,
} = safetyIncidentApi

export {
  TYPE_LABELS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  PRIORITY_LABELS,
  SEVERITY_LABELS,
} from '@/services/mock/safetyIncidentData'
