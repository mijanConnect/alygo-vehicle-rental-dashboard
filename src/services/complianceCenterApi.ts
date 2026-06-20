import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import {
  buildDocumentMonitorRecords,
  computeComplianceOverview,
  mockBackgroundCheckRecords,
  mockDriverRestrictions,
  paginateComplianceList,
} from '@/services/mock/complianceCenterData'
import type {
  BackgroundCheckRecord,
  BackgroundCheckStatus,
  ComplianceListParams,
  ComplianceListResponse,
  ComplianceOverview,
  DocumentMonitorRecord,
  DriverRestrictionFormValues,
  DriverRestrictionRecord,
} from '@/types/complianceCenter'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const complianceCenterApi = createApi({
  reducerPath: 'complianceCenterApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    'ComplianceOverview',
    'BackgroundChecks',
    'DocumentMonitoring',
    'DriverRestrictions',
  ],
  endpoints: (builder) => ({
    getComplianceOverview: builder.query<ComplianceOverview, void>({
      queryFn: async () => {
        await delay()
        return { data: computeComplianceOverview() }
      },
      providesTags: ['ComplianceOverview'],
    }),
    getBackgroundChecks: builder.query<
      ComplianceListResponse<BackgroundCheckRecord>,
      ComplianceListParams | void
    >({
      queryFn: async (params) => {
        await delay()
        return {
          data: paginateComplianceList(mockBackgroundCheckRecords, params ?? {}, [
            'driverName',
            'provider',
            'status',
          ]),
        }
      },
      providesTags: ['BackgroundChecks'],
    }),
    updateBackgroundCheckStatus: builder.mutation<
      BackgroundCheckRecord,
      { id: string; status: BackgroundCheckStatus }
    >({
      queryFn: async ({ id, status }) => {
        await delay()
        const index = mockBackgroundCheckRecords.findIndex((b) => b.id === id)
        if (index === -1) return { error: { status: 404, data: 'Background check not found' } }

        mockBackgroundCheckRecords[index] = {
          ...mockBackgroundCheckRecords[index],
          status,
          completedAt:
            status === 'approved' || status === 'rejected'
              ? new Date().toISOString()
              : mockBackgroundCheckRecords[index].completedAt,
        }
        return { data: mockBackgroundCheckRecords[index] }
      },
      invalidatesTags: ['BackgroundChecks', 'ComplianceOverview'],
    }),
    getDocumentMonitoring: builder.query<
      ComplianceListResponse<DocumentMonitorRecord>,
      ComplianceListParams | void
    >({
      queryFn: async (params) => {
        await delay()
        const records = buildDocumentMonitorRecords()
        return {
          data: paginateComplianceList(records, params ?? {}, [
            'driverName',
            'documentType',
            'status',
          ]),
        }
      },
      providesTags: ['DocumentMonitoring'],
    }),
    getDriverRestrictions: builder.query<
      ComplianceListResponse<DriverRestrictionRecord>,
      ComplianceListParams | void
    >({
      queryFn: async (params) => {
        await delay()
        return {
          data: paginateComplianceList(mockDriverRestrictions, params ?? {}, [
            'driverName',
            'reason',
            'restrictedCategories',
          ]),
        }
      },
      providesTags: ['DriverRestrictions'],
    }),
    createDriverRestriction: builder.mutation<
      DriverRestrictionRecord,
      DriverRestrictionFormValues
    >({
      queryFn: async (values) => {
        await delay()
        const restriction: DriverRestrictionRecord = {
          id: `DR-${Date.now()}`,
          driverId: `DR-TEMP-${Date.now()}`,
          ...values,
        }
        mockDriverRestrictions.unshift(restriction)
        return { data: restriction }
      },
      invalidatesTags: ['DriverRestrictions', 'ComplianceOverview'],
    }),
    updateDriverRestriction: builder.mutation<
      DriverRestrictionRecord,
      { id: string } & DriverRestrictionFormValues
    >({
      queryFn: async ({ id, ...values }) => {
        await delay()
        const index = mockDriverRestrictions.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Restriction not found' } }

        mockDriverRestrictions[index] = {
          ...mockDriverRestrictions[index],
          ...values,
        }
        return { data: mockDriverRestrictions[index] }
      },
      invalidatesTags: ['DriverRestrictions', 'ComplianceOverview'],
    }),
    removeDriverRestriction: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockDriverRestrictions.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Restriction not found' } }
        mockDriverRestrictions.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['DriverRestrictions', 'ComplianceOverview'],
    }),
  }),
})

export const {
  useGetComplianceOverviewQuery,
  useGetBackgroundChecksQuery,
  useUpdateBackgroundCheckStatusMutation,
  useGetDocumentMonitoringQuery,
  useGetDriverRestrictionsQuery,
  useCreateDriverRestrictionMutation,
  useUpdateDriverRestrictionMutation,
  useRemoveDriverRestrictionMutation,
} = complianceCenterApi
