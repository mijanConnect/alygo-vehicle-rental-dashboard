import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  DeliveryFeeSetting,
  DriverCompensationSettings,
  LostFoundAnalyticsData,
  LostFoundDispute,
  LostFoundOverview,
  LostItemCategory,
  LostItemReport,
  LostItemReportStatus,
  ReturnRecord,
  ReturnStatus,
} from '@/types/lostFound'
import {
  computeLostFoundOverview,
  mockDeliveryFeeSettings,
  mockDriverCompensationSettings,
  mockLostFoundAnalytics,
  mockLostFoundDisputes,
  mockLostItemCategories,
  mockLostItemReports,
  mockReturnRecords,
} from '@/services/mock/lostFoundData'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const lostFoundApi = createApi({
  reducerPath: 'lostFoundApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    'LostFoundOverview',
    'LostItemReports',
    'ReturnRecords',
    'DeliveryFees',
    'Categories',
    'Compensation',
    'Disputes',
    'LostFoundAnalytics',
  ],
  endpoints: (builder) => ({
    getLostFoundOverview: builder.query<LostFoundOverview, void>({
      queryFn: async () => {
        await delay()
        return { data: computeLostFoundOverview() }
      },
      providesTags: ['LostFoundOverview'],
    }),
    getLostItemReports: builder.query<LostItemReport[], void>({
      queryFn: async () => ({ data: [...mockLostItemReports] }),
      providesTags: ['LostItemReports'],
    }),
    getLostItemReportById: builder.query<LostItemReport | undefined, string>({
      queryFn: async (id) => {
        await delay()
        return { data: mockLostItemReports.find((r) => r.id === id) }
      },
      providesTags: ['LostItemReports'],
    }),
    getReturnRecords: builder.query<ReturnRecord[], void>({
      queryFn: async () => ({ data: [...mockReturnRecords] }),
      providesTags: ['ReturnRecords'],
    }),
    getDeliveryFeeSettings: builder.query<DeliveryFeeSetting[], void>({
      queryFn: async () => ({ data: [...mockDeliveryFeeSettings] }),
      providesTags: ['DeliveryFees'],
    }),
    getLostItemCategories: builder.query<LostItemCategory[], void>({
      queryFn: async () => ({ data: [...mockLostItemCategories] }),
      providesTags: ['Categories'],
    }),
    getDriverCompensationSettings: builder.query<DriverCompensationSettings, void>({
      queryFn: async () => ({ data: { ...mockDriverCompensationSettings } }),
      providesTags: ['Compensation'],
    }),
    getLostFoundDisputes: builder.query<LostFoundDispute[], void>({
      queryFn: async () => ({ data: [...mockLostFoundDisputes] }),
      providesTags: ['Disputes'],
    }),
    getLostFoundAnalytics: builder.query<LostFoundAnalyticsData, void>({
      queryFn: async () => ({ data: mockLostFoundAnalytics }),
      providesTags: ['LostFoundAnalytics'],
    }),
    updateLostItemReportStatus: builder.mutation<
      LostItemReport,
      { id: string; status: LostItemReportStatus; assignedAdmin?: string }
    >({
      queryFn: async ({ id, status, assignedAdmin }) => {
        await delay()
        const index = mockLostItemReports.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Report not found' } }
        mockLostItemReports[index] = {
          ...mockLostItemReports[index],
          status,
          assignedAdmin: assignedAdmin ?? mockLostItemReports[index].assignedAdmin,
          timeline: [
            ...mockLostItemReports[index].timeline,
            {
              id: `tl-${Date.now()}`,
              label: 'Status Updated',
              description: `Status changed to ${status.replace(/_/g, ' ')}`,
              timestamp: new Date().toISOString(),
              actor: 'Admin',
            },
          ],
        }
        return { data: mockLostItemReports[index] }
      },
      invalidatesTags: ['LostItemReports', 'LostFoundOverview', 'LostFoundAnalytics'],
    }),
    assignLostItemCase: builder.mutation<LostItemReport, { id: string; assignedAdmin: string }>({
      queryFn: async ({ id, assignedAdmin }) => {
        await delay()
        const index = mockLostItemReports.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Report not found' } }
        mockLostItemReports[index] = {
          ...mockLostItemReports[index],
          assignedAdmin,
          timeline: [
            ...mockLostItemReports[index].timeline,
            {
              id: `tl-${Date.now()}`,
              label: 'Case Assigned',
              description: `Assigned to ${assignedAdmin}`,
              timestamp: new Date().toISOString(),
              actor: 'Admin',
            },
          ],
        }
        return { data: mockLostItemReports[index] }
      },
      invalidatesTags: ['LostItemReports'],
    }),
    closeLostItemCase: builder.mutation<LostItemReport, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockLostItemReports.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Report not found' } }
        mockLostItemReports[index] = {
          ...mockLostItemReports[index],
          status: 'closed',
          timeline: [
            ...mockLostItemReports[index].timeline,
            {
              id: `tl-${Date.now()}`,
              label: 'Case Closed',
              description: 'Case closed by administrator',
              timestamp: new Date().toISOString(),
              actor: 'Admin',
            },
          ],
        }
        return { data: mockLostItemReports[index] }
      },
      invalidatesTags: ['LostItemReports', 'LostFoundOverview'],
    }),
    updateReturnStatus: builder.mutation<ReturnRecord, { id: string; returnStatus: ReturnStatus }>({
      queryFn: async ({ id, returnStatus }) => {
        await delay()
        const index = mockReturnRecords.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Return not found' } }
        mockReturnRecords[index] = { ...mockReturnRecords[index], returnStatus }
        return { data: mockReturnRecords[index] }
      },
      invalidatesTags: ['ReturnRecords', 'LostFoundOverview', 'LostFoundAnalytics'],
    }),
    completeReturn: builder.mutation<ReturnRecord, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockReturnRecords.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Return not found' } }
        mockReturnRecords[index] = { ...mockReturnRecords[index], returnStatus: 'returned' }
        const reportIndex = mockLostItemReports.findIndex(
          (r) => r.id === mockReturnRecords[index].reportId,
        )
        if (reportIndex !== -1) {
          mockLostItemReports[reportIndex] = {
            ...mockLostItemReports[reportIndex],
            status: 'completed',
          }
        }
        return { data: mockReturnRecords[index] }
      },
      invalidatesTags: ['ReturnRecords', 'LostItemReports', 'LostFoundOverview', 'LostFoundAnalytics'],
    }),
    updateDeliveryFeeSetting: builder.mutation<
      DeliveryFeeSetting,
      Partial<DeliveryFeeSetting> & { id: string }
    >({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockDeliveryFeeSettings.findIndex((f) => f.id === id)
        if (index === -1) return { error: { status: 404, data: 'Setting not found' } }
        mockDeliveryFeeSettings[index] = { ...mockDeliveryFeeSettings[index], ...updates }
        return { data: mockDeliveryFeeSettings[index] }
      },
      invalidatesTags: ['DeliveryFees'],
    }),
    createLostItemCategory: builder.mutation<LostItemCategory, { name: string }>({
      queryFn: async ({ name }) => {
        await delay()
        const category: LostItemCategory = { id: `cat-${Date.now()}`, name, status: 'active' }
        mockLostItemCategories.unshift(category)
        return { data: category }
      },
      invalidatesTags: ['Categories'],
    }),
    updateLostItemCategory: builder.mutation<LostItemCategory, { id: string; name: string }>({
      queryFn: async ({ id, name }) => {
        await delay()
        const index = mockLostItemCategories.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Category not found' } }
        mockLostItemCategories[index] = { ...mockLostItemCategories[index], name }
        return { data: mockLostItemCategories[index] }
      },
      invalidatesTags: ['Categories'],
    }),
    deleteLostItemCategory: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockLostItemCategories.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Category not found' } }
        mockLostItemCategories.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['Categories'],
    }),
    updateDriverCompensationSettings: builder.mutation<
      DriverCompensationSettings,
      DriverCompensationSettings
    >({
      queryFn: async (settings) => {
        await delay()
        Object.assign(mockDriverCompensationSettings, settings)
        return { data: { ...mockDriverCompensationSettings } }
      },
      invalidatesTags: ['Compensation'],
    }),
    resolveDispute: builder.mutation<LostFoundDispute, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockLostFoundDisputes.findIndex((d) => d.id === id)
        if (index === -1) return { error: { status: 404, data: 'Dispute not found' } }
        mockLostFoundDisputes[index] = { ...mockLostFoundDisputes[index], status: 'resolved' }
        return { data: mockLostFoundDisputes[index] }
      },
      invalidatesTags: ['Disputes', 'LostFoundOverview'],
    }),
    escalateDispute: builder.mutation<LostFoundDispute, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockLostFoundDisputes.findIndex((d) => d.id === id)
        if (index === -1) return { error: { status: 404, data: 'Dispute not found' } }
        mockLostFoundDisputes[index] = {
          ...mockLostFoundDisputes[index],
          status: 'escalated',
          priority: 'critical',
          assignedAdmin: 'Ops Manager',
        }
        return { data: mockLostFoundDisputes[index] }
      },
      invalidatesTags: ['Disputes', 'LostFoundOverview'],
    }),
    assignDispute: builder.mutation<LostFoundDispute, { id: string; assignedAdmin: string }>({
      queryFn: async ({ id, assignedAdmin }) => {
        await delay()
        const index = mockLostFoundDisputes.findIndex((d) => d.id === id)
        if (index === -1) return { error: { status: 404, data: 'Dispute not found' } }
        mockLostFoundDisputes[index] = {
          ...mockLostFoundDisputes[index],
          assignedAdmin,
          status: 'in_review',
        }
        return { data: mockLostFoundDisputes[index] }
      },
      invalidatesTags: ['Disputes'],
    }),
  }),
})

export const {
  useGetLostFoundOverviewQuery,
  useGetLostItemReportsQuery,
  useGetLostItemReportByIdQuery,
  useGetReturnRecordsQuery,
  useGetDeliveryFeeSettingsQuery,
  useGetLostItemCategoriesQuery,
  useGetDriverCompensationSettingsQuery,
  useGetLostFoundDisputesQuery,
  useGetLostFoundAnalyticsQuery,
  useUpdateLostItemReportStatusMutation,
  useAssignLostItemCaseMutation,
  useCloseLostItemCaseMutation,
  useUpdateReturnStatusMutation,
  useCompleteReturnMutation,
  useUpdateDeliveryFeeSettingMutation,
  useCreateLostItemCategoryMutation,
  useUpdateLostItemCategoryMutation,
  useDeleteLostItemCategoryMutation,
  useUpdateDriverCompensationSettingsMutation,
  useResolveDisputeMutation,
  useEscalateDisputeMutation,
  useAssignDisputeMutation,
} = lostFoundApi
