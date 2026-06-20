import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  TripCompletionAnalytics,
  TripCompletionComplaint,
  TripCompletionOverview,
  TripComplaintStatus,
} from '@/types/tripCompletionReview'
import {
  appendAuditLog,
  computeTripCompletionOverview,
  mockTripCompletionAnalytics,
  mockTripComplaints,
} from '@/services/mock/tripCompletionReviewData'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const tripCompletionReviewApi = createApi({
  reducerPath: 'tripCompletionReviewApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['TripComplaints', 'TripCompletionOverview', 'TripCompletionAnalytics'],
  endpoints: (builder) => ({
    getTripCompletionOverview: builder.query<TripCompletionOverview, void>({
      queryFn: async () => {
        await delay()
        return { data: computeTripCompletionOverview() }
      },
      providesTags: ['TripCompletionOverview'],
    }),
    getTripComplaints: builder.query<TripCompletionComplaint[], void>({
      queryFn: async () => ({ data: [...mockTripComplaints] }),
      providesTags: ['TripComplaints'],
    }),
    getTripComplaintById: builder.query<TripCompletionComplaint | undefined, string>({
      queryFn: async (id) => {
        await delay()
        return { data: mockTripComplaints.find((c) => c.id === id) }
      },
      providesTags: ['TripComplaints'],
    }),
    getTripCompletionAnalytics: builder.query<TripCompletionAnalytics, void>({
      queryFn: async () => ({ data: mockTripCompletionAnalytics }),
      providesTags: ['TripCompletionAnalytics'],
    }),
    updateTripComplaintStatus: builder.mutation<
      TripCompletionComplaint,
      { id: string; status: TripComplaintStatus; resolutionNotes?: string; refundAmount?: number }
    >({
      queryFn: async ({ id, status, resolutionNotes, refundAmount }) => {
        await delay()
        const index = mockTripComplaints.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Complaint not found' } }
        mockTripComplaints[index] = {
          ...mockTripComplaints[index],
          status,
          resolutionNotes: resolutionNotes ?? mockTripComplaints[index].resolutionNotes,
          refundAmount: refundAmount ?? mockTripComplaints[index].refundAmount,
        }
        return { data: mockTripComplaints[index] }
      },
      invalidatesTags: ['TripComplaints', 'TripCompletionOverview', 'TripCompletionAnalytics'],
    }),
    approveRefund: builder.mutation<TripCompletionComplaint, { id: string; amount?: number }>({
      queryFn: async ({ id, amount }) => {
        await delay()
        const index = mockTripComplaints.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Complaint not found' } }
        const refundAmount = amount ?? mockTripComplaints[index].fareTotal
        mockTripComplaints[index] = {
          ...mockTripComplaints[index],
          status: 'approved_refund',
          refundAmount,
          resolutionNotes: `Full refund of $${refundAmount.toFixed(2)} approved`,
        }
        appendAuditLog(id, 'Approve Refund', 'Admin', `Full refund $${refundAmount.toFixed(2)}`)
        return { data: mockTripComplaints[index] }
      },
      invalidatesTags: ['TripComplaints', 'TripCompletionOverview', 'TripCompletionAnalytics'],
    }),
    partialRefund: builder.mutation<TripCompletionComplaint, { id: string; amount: number }>({
      queryFn: async ({ id, amount }) => {
        await delay()
        const index = mockTripComplaints.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Complaint not found' } }
        mockTripComplaints[index] = {
          ...mockTripComplaints[index],
          status: 'partial_refund',
          refundAmount: amount,
          resolutionNotes: `Partial refund of $${amount.toFixed(2)} approved`,
        }
        appendAuditLog(id, 'Partial Refund', 'Admin', `$${amount.toFixed(2)} partial refund`)
        return { data: mockTripComplaints[index] }
      },
      invalidatesTags: ['TripComplaints', 'TripCompletionOverview', 'TripCompletionAnalytics'],
    }),
    rejectComplaint: builder.mutation<TripCompletionComplaint, { id: string; notes?: string }>({
      queryFn: async ({ id, notes }) => {
        await delay()
        const index = mockTripComplaints.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Complaint not found' } }
        mockTripComplaints[index] = {
          ...mockTripComplaints[index],
          status: 'rejected',
          resolutionNotes: notes ?? 'Complaint rejected after review',
        }
        appendAuditLog(id, 'Reject Complaint', 'Admin', notes)
        return { data: mockTripComplaints[index] }
      },
      invalidatesTags: ['TripComplaints', 'TripCompletionOverview', 'TripCompletionAnalytics'],
    }),
    adjustFare: builder.mutation<TripCompletionComplaint, { id: string; newTotal: number; notes?: string }>({
      queryFn: async ({ id, newTotal, notes }) => {
        await delay()
        const index = mockTripComplaints.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Complaint not found' } }
        mockTripComplaints[index] = {
          ...mockTripComplaints[index],
          status: 'fare_adjusted',
          fareTotal: newTotal,
          resolutionNotes: notes ?? `Fare adjusted to $${newTotal.toFixed(2)}`,
        }
        appendAuditLog(id, 'Adjust Fare', 'Admin', `New fare: $${newTotal.toFixed(2)}`)
        return { data: mockTripComplaints[index] }
      },
      invalidatesTags: ['TripComplaints', 'TripCompletionOverview', 'TripCompletionAnalytics'],
    }),
    addDriverWarning: builder.mutation<TripCompletionComplaint, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockTripComplaints.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Complaint not found' } }
        appendAuditLog(id, 'Add Driver Warning', 'Admin', `Warning issued to ${mockTripComplaints[index].driverName}`)
        return { data: mockTripComplaints[index] }
      },
      invalidatesTags: ['TripComplaints'],
    }),
    suspendDriverFromComplaint: builder.mutation<TripCompletionComplaint, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockTripComplaints.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Complaint not found' } }
        appendAuditLog(id, 'Suspend Driver', 'Admin', `Driver ${mockTripComplaints[index].driverName} suspended`)
        return { data: mockTripComplaints[index] }
      },
      invalidatesTags: ['TripComplaints'],
    }),
  }),
})

export const {
  useGetTripCompletionOverviewQuery,
  useGetTripComplaintsQuery,
  useGetTripComplaintByIdQuery,
  useGetTripCompletionAnalyticsQuery,
  useUpdateTripComplaintStatusMutation,
  useApproveRefundMutation,
  usePartialRefundMutation,
  useRejectComplaintMutation,
  useAdjustFareMutation,
  useAddDriverWarningMutation,
  useSuspendDriverFromComplaintMutation,
} = tripCompletionReviewApi
