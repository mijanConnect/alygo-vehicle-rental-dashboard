import { baseApi } from '@/redux/baseApi'
import {
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
import { cleanObject } from '@/utils/cleanObject'

export const complianceCenterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComplianceOverview: builder.query<ComplianceOverview, void>({
      queryFn: () => {
        return { data: computeComplianceOverview() }
      },
    }),

    getBackgroundChecks: builder.query<
      ComplianceListResponse<BackgroundCheckRecord>,
      ComplianceListParams | void
    >({
      queryFn: (params) => {
        return {
          data: paginateComplianceList(mockBackgroundCheckRecords, params ?? {}, [
            'driverName',
            'provider',
            'status',
          ]),
        }
      },
    }),

    updateBackgroundCheckStatus: builder.mutation<
      BackgroundCheckRecord,
      { id: string; status: BackgroundCheckStatus }
    >({
      queryFn: ({ id, status }) => {
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
    }),

    getDocumentMonitoring: builder.query<
      ComplianceListResponse<DocumentMonitorRecord>,
      ComplianceListParams | void
    >({
      query: (params) => ({
        url: '/compliance-center/document-monitoring',
        method: 'GET',
        params: cleanObject({
          page: params?.page ?? 1,
          limit: params?.pageSize ?? 10,
          search: params?.search?.trim() || undefined,
        }),
      }),
      transformResponse: (response: any) => {
        const flatDocuments: DocumentMonitorRecord[] = (response.data ?? []).flatMap((driver: any) =>
          (driver.documents ?? []).map((doc: any) => ({
            id: doc.id,
            driverId: driver.driverId,
            driverName: driver.driverName,
            documentType: doc.documentType,
            expiryDate: doc.expirationDate,
            daysRemaining: doc.daysRemaining,
            status: doc.status,
          }))
        )
        return {
          data: flatDocuments,
          total: response.meta?.total ?? flatDocuments.length,
          page: response.meta?.page ?? 1,
          pageSize: response.meta?.limit ?? 10,
        }
      },
      providesTags: ['Compliance'],
    }),

    getDriverRestrictions: builder.query<
      ComplianceListResponse<DriverRestrictionRecord>,
      ComplianceListParams | void
    >({
      queryFn: (params) => {
        return {
          data: paginateComplianceList(mockDriverRestrictions, params ?? {}, [
            'driverName',
            'reason',
            'restrictedCategories',
          ]),
        }
      },
    }),

    createDriverRestriction: builder.mutation<
      DriverRestrictionRecord,
      DriverRestrictionFormValues
    >({
      queryFn: (values) => {
        const restriction: DriverRestrictionRecord = {
          id: `DR-${Date.now()}`,
          driverId: `DR-TEMP-${Date.now()}`,
          ...values,
        }
        mockDriverRestrictions.unshift(restriction)
        return { data: restriction }
      },
    }),

    updateDriverRestriction: builder.mutation<
      DriverRestrictionRecord,
      { id: string } & DriverRestrictionFormValues
    >({
      queryFn: ({ id, ...values }) => {
        const index = mockDriverRestrictions.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Restriction not found' } }

        mockDriverRestrictions[index] = {
          ...mockDriverRestrictions[index],
          ...values,
        }
        return { data: mockDriverRestrictions[index] }
      },
    }),

    removeDriverRestriction: builder.mutation<void, string>({
      queryFn: (id) => {
        const index = mockDriverRestrictions.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Restriction not found' } }
        mockDriverRestrictions.splice(index, 1)
        return { data: undefined }
      },
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
