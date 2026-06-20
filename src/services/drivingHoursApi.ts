import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  CityDrivingRule,
  CityRulesSummary,
  DriverHoursRecord,
  DrivingHoursAnalytics,
  DrivingHoursGlobalPolicy,
  DrivingHoursOverview,
  StateDrivingRule,
  StateRulesSummary,
} from '@/types/drivingHours'
import {
  computeCityRulesSummary,
  computeDrivingHoursOverview,
  computeStateRulesSummary,
  mockCityDrivingRules,
  mockDriverHoursRecords,
  mockDrivingHoursAnalytics,
  mockDrivingHoursPolicy,
  mockStateDrivingRules,
} from '@/services/mock/drivingHoursData'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const drivingHoursApi = createApi({
  reducerPath: 'drivingHoursApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    'DrivingHoursPolicy',
    'StateRules',
    'CityRules',
    'DriverHours',
    'DrivingHoursOverview',
    'DrivingHoursAnalytics',
    'StateRulesSummary',
    'CityRulesSummary',
  ],
  endpoints: (builder) => ({
    getDrivingHoursOverview: builder.query<DrivingHoursOverview, void>({
      queryFn: async () => {
        await delay()
        return { data: computeDrivingHoursOverview() }
      },
      providesTags: ['DrivingHoursOverview'],
    }),
    getStateRulesSummary: builder.query<StateRulesSummary, void>({
      queryFn: async () => ({ data: computeStateRulesSummary() }),
      providesTags: ['StateRulesSummary'],
    }),
    getCityRulesSummary: builder.query<CityRulesSummary, void>({
      queryFn: async () => ({ data: computeCityRulesSummary() }),
      providesTags: ['CityRulesSummary'],
    }),
    getDrivingHoursPolicy: builder.query<DrivingHoursGlobalPolicy, void>({
      queryFn: async () => ({ data: { ...mockDrivingHoursPolicy } }),
      providesTags: ['DrivingHoursPolicy'],
    }),
    updateDrivingHoursPolicy: builder.mutation<DrivingHoursGlobalPolicy, Partial<DrivingHoursGlobalPolicy>>({
      queryFn: async (updates) => {
        await delay()
        Object.assign(mockDrivingHoursPolicy, updates)
        return { data: { ...mockDrivingHoursPolicy } }
      },
      invalidatesTags: ['DrivingHoursPolicy', 'DrivingHoursOverview', 'CityRules'],
    }),
    getStateDrivingRules: builder.query<StateDrivingRule[], void>({
      queryFn: async () => ({ data: [...mockStateDrivingRules] }),
      providesTags: ['StateRules'],
    }),
    createStateDrivingRule: builder.mutation<StateDrivingRule, Omit<StateDrivingRule, 'id' | 'violations'>>({
      queryFn: async (payload) => {
        await delay()
        const rule: StateDrivingRule = {
          ...payload,
          id: `sd-${Date.now()}`,
          violations: 0,
        }
        mockStateDrivingRules.push(rule)
        return { data: rule }
      },
      invalidatesTags: ['StateRules', 'StateRulesSummary'],
    }),
    updateStateDrivingRule: builder.mutation<StateDrivingRule, Partial<StateDrivingRule> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockStateDrivingRules.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Rule not found' } }
        mockStateDrivingRules[index] = { ...mockStateDrivingRules[index], ...updates }
        return { data: mockStateDrivingRules[index] }
      },
      invalidatesTags: ['StateRules', 'StateRulesSummary', 'CityRules'],
    }),
    deleteStateDrivingRule: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockStateDrivingRules.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Rule not found' } }
        mockStateDrivingRules.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['StateRules', 'StateRulesSummary', 'CityRules'],
    }),
    duplicateStateDrivingRule: builder.mutation<StateDrivingRule, string>({
      queryFn: async (id) => {
        await delay()
        const source = mockStateDrivingRules.find((r) => r.id === id)
        if (!source) return { error: { status: 404, data: 'Rule not found' } }
        const duplicate: StateDrivingRule = {
          ...source,
          id: `sd-${Date.now()}`,
          state: `${source.state} (Copy)`,
          violations: 0,
        }
        mockStateDrivingRules.push(duplicate)
        return { data: duplicate }
      },
      invalidatesTags: ['StateRules', 'StateRulesSummary'],
    }),
    getCityDrivingRules: builder.query<CityDrivingRule[], void>({
      queryFn: async () => ({ data: [...mockCityDrivingRules] }),
      providesTags: ['CityRules'],
    }),
    createCityDrivingRule: builder.mutation<CityDrivingRule, Omit<CityDrivingRule, 'id' | 'violations'>>({
      queryFn: async (payload) => {
        await delay()
        const rule: CityDrivingRule = {
          ...payload,
          id: `cd-${Date.now()}`,
          violations: 0,
          inheritanceSource: payload.inheritanceSource ?? 'custom',
        }
        mockCityDrivingRules.push(rule)
        return { data: rule }
      },
      invalidatesTags: ['CityRules', 'CityRulesSummary'],
    }),
    updateCityDrivingRule: builder.mutation<CityDrivingRule, Partial<CityDrivingRule> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockCityDrivingRules.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Rule not found' } }
        mockCityDrivingRules[index] = {
          ...mockCityDrivingRules[index],
          ...updates,
          inheritanceSource: updates.inheritanceSource ?? mockCityDrivingRules[index].inheritanceSource,
        }
        return { data: mockCityDrivingRules[index] }
      },
      invalidatesTags: ['CityRules', 'CityRulesSummary'],
    }),
    deleteCityDrivingRule: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockCityDrivingRules.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Rule not found' } }
        mockCityDrivingRules.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['CityRules', 'CityRulesSummary'],
    }),
    bulkImportStateRules: builder.mutation<StateDrivingRule[], StateDrivingRule[]>({
      queryFn: async (rules) => {
        await delay(500)
        const imported = rules.map((r) => ({
          ...r,
          id: r.id || `sd-${Date.now()}-${Math.random()}`,
          violations: r.violations ?? 0,
        }))
        mockStateDrivingRules.push(...imported)
        return { data: imported }
      },
      invalidatesTags: ['StateRules', 'StateRulesSummary'],
    }),
    bulkImportCityRules: builder.mutation<CityDrivingRule[], CityDrivingRule[]>({
      queryFn: async (rules) => {
        await delay(500)
        const imported = rules.map((r) => ({
          ...r,
          id: r.id || `cd-${Date.now()}-${Math.random()}`,
          violations: r.violations ?? 0,
        }))
        mockCityDrivingRules.push(...imported)
        return { data: imported }
      },
      invalidatesTags: ['CityRules', 'CityRulesSummary'],
    }),
    getDriverHoursRecords: builder.query<DriverHoursRecord[], void>({
      queryFn: async () => ({ data: [...mockDriverHoursRecords] }),
      providesTags: ['DriverHours'],
    }),
    getDrivingHoursAnalytics: builder.query<DrivingHoursAnalytics, void>({
      queryFn: async () => ({ data: mockDrivingHoursAnalytics }),
      providesTags: ['DrivingHoursAnalytics'],
    }),
  }),
})

export const {
  useGetDrivingHoursOverviewQuery,
  useGetStateRulesSummaryQuery,
  useGetCityRulesSummaryQuery,
  useGetDrivingHoursPolicyQuery,
  useUpdateDrivingHoursPolicyMutation,
  useGetStateDrivingRulesQuery,
  useCreateStateDrivingRuleMutation,
  useUpdateStateDrivingRuleMutation,
  useDeleteStateDrivingRuleMutation,
  useDuplicateStateDrivingRuleMutation,
  useGetCityDrivingRulesQuery,
  useCreateCityDrivingRuleMutation,
  useUpdateCityDrivingRuleMutation,
  useDeleteCityDrivingRuleMutation,
  useBulkImportStateRulesMutation,
  useBulkImportCityRulesMutation,
  useGetDriverHoursRecordsQuery,
  useGetDrivingHoursAnalyticsQuery,
} = drivingHoursApi
