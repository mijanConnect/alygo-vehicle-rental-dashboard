import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  DriverVerification,
  IdentityVerificationOverview,
  IdentityVerificationSettings,
  VerificationHistoryEntry,
} from '@/types/driverVerification'
import type { IdentityVerificationStatus } from '@/types/driverVerification'
import {
  computeIdentityVerificationOverview,
  getHistoryForDriver,
  getVerificationForDriver,
  mockDriverVerifications,
  mockIdentityVerificationSettings,
  mockVerificationHistory,
} from '@/services/mock/driverVerificationData'
import { mockDrivers } from '@/services/mock/data'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

function syncDriverStatus(driverId: string, status: IdentityVerificationStatus) {
  const driver = mockDrivers.find((d) => d.id === driverId)
  if (driver) driver.identityVerificationStatus = status
}

export const driverVerificationApi = createApi({
  reducerPath: 'driverVerificationApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['DriverVerification', 'VerificationHistory', 'VerificationSettings', 'VerificationOverview'],
  endpoints: (builder) => ({
    getIdentityVerificationOverview: builder.query<IdentityVerificationOverview, void>({
      queryFn: async () => ({ data: computeIdentityVerificationOverview() }),
      providesTags: ['VerificationOverview'],
    }),
    getDriverVerification: builder.query<DriverVerification | undefined, string>({
      queryFn: async (driverId) => {
        await delay()
        return { data: getVerificationForDriver(driverId) }
      },
      providesTags: (_r, _e, id) => [{ type: 'DriverVerification', id }],
    }),
    getVerificationHistory: builder.query<VerificationHistoryEntry[], string>({
      queryFn: async (driverId) => ({ data: getHistoryForDriver(driverId) }),
      providesTags: (_r, _e, id) => [{ type: 'VerificationHistory', id }],
    }),
    getIdentityVerificationSettings: builder.query<IdentityVerificationSettings, void>({
      queryFn: async () => ({ data: { ...mockIdentityVerificationSettings } }),
      providesTags: ['VerificationSettings'],
    }),
    updateIdentityVerificationSettings: builder.mutation<IdentityVerificationSettings, Partial<IdentityVerificationSettings>>({
      queryFn: async (updates) => {
        await delay()
        Object.assign(mockIdentityVerificationSettings, updates)
        return { data: { ...mockIdentityVerificationSettings } }
      },
      invalidatesTags: ['VerificationSettings'],
    }),
    requestReVerification: builder.mutation<
      DriverVerification,
      { driverId: string; triggerReason: string; requireBeforeNextTrip?: boolean; pauseRides?: boolean }
    >({
      queryFn: async ({ driverId, triggerReason, requireBeforeNextTrip = false, pauseRides = false }) => {
        await delay()
        const index = mockDriverVerifications.findIndex((v) => v.driverId === driverId)
        if (index === -1) return { error: { status: 404, data: 'Driver verification not found' } }
        const now = new Date().toISOString()
        mockDriverVerifications[index] = {
          ...mockDriverVerifications[index],
          status: 'pending_re_verification',
          triggerSource: 'manual_admin_request',
          triggerReason,
          requireBeforeNextTrip,
          ridesPaused: pauseRides,
          updatedAt: now,
        }
        mockVerificationHistory.unshift({
          id: `vh-${Date.now()}`,
          driverId,
          date: now,
          triggerSource: 'Admin Requested Verification',
          status: 'pending_re_verification',
          reviewedBy: 'Admin',
          notes: `Re-verification requested: ${triggerReason}`,
        })
        syncDriverStatus(driverId, 'pending_re_verification')
        return { data: mockDriverVerifications[index] }
      },
      invalidatesTags: (_r, _e, { driverId }) => [
        { type: 'DriverVerification', id: driverId },
        { type: 'VerificationHistory', id: driverId },
        'VerificationOverview',
      ],
    }),
    approveVerification: builder.mutation<DriverVerification, string>({
      queryFn: async (driverId) => {
        await delay()
        const index = mockDriverVerifications.findIndex((v) => v.driverId === driverId)
        if (index === -1) return { error: { status: 404, data: 'Driver verification not found' } }
        const now = new Date().toISOString()
        mockDriverVerifications[index] = {
          ...mockDriverVerifications[index],
          status: 'verified',
          reviewedBy: 'Admin',
          verifiedAt: now,
          lastVerifiedAt: now,
          requireBeforeNextTrip: false,
          ridesPaused: false,
          updatedAt: now,
        }
        mockVerificationHistory.unshift({
          id: `vh-${Date.now()}`,
          driverId,
          date: now,
          triggerSource: 'Admin Review',
          status: 'verified',
          reviewedBy: 'Admin',
          notes: 'Identity verification approved',
        })
        syncDriverStatus(driverId, 'verified')
        return { data: mockDriverVerifications[index] }
      },
      invalidatesTags: (_r, _e, driverId) => [
        { type: 'DriverVerification', id: driverId },
        { type: 'VerificationHistory', id: driverId },
        'VerificationOverview',
      ],
    }),
    rejectVerification: builder.mutation<DriverVerification, { driverId: string; notes?: string }>({
      queryFn: async ({ driverId, notes }) => {
        await delay()
        const index = mockDriverVerifications.findIndex((v) => v.driverId === driverId)
        if (index === -1) return { error: { status: 404, data: 'Driver verification not found' } }
        const now = new Date().toISOString()
        mockDriverVerifications[index] = {
          ...mockDriverVerifications[index],
          status: 'failed_verification',
          reviewedBy: 'Admin',
          reviewNotes: notes ?? 'Verification rejected',
          ridesPaused: mockIdentityVerificationSettings.autoPauseAfterFailed,
          updatedAt: now,
        }
        mockVerificationHistory.unshift({
          id: `vh-${Date.now()}`,
          driverId,
          date: now,
          triggerSource: 'Admin Review',
          status: 'failed_verification',
          reviewedBy: 'Admin',
          notes: notes ?? 'Verification rejected',
        })
        syncDriverStatus(driverId, 'failed_verification')
        return { data: mockDriverVerifications[index] }
      },
      invalidatesTags: (_r, _e, { driverId }) => [
        { type: 'DriverVerification', id: driverId },
        { type: 'VerificationHistory', id: driverId },
        'VerificationOverview',
      ],
    }),
    updateVerificationSecurity: builder.mutation<
      DriverVerification,
      { driverId: string; requireBeforeNextTrip?: boolean; ridesPaused?: boolean }
    >({
      queryFn: async ({ driverId, requireBeforeNextTrip, ridesPaused }) => {
        await delay()
        const index = mockDriverVerifications.findIndex((v) => v.driverId === driverId)
        if (index === -1) return { error: { status: 404, data: 'Driver verification not found' } }
        mockDriverVerifications[index] = {
          ...mockDriverVerifications[index],
          requireBeforeNextTrip: requireBeforeNextTrip ?? mockDriverVerifications[index].requireBeforeNextTrip,
          ridesPaused: ridesPaused ?? mockDriverVerifications[index].ridesPaused,
          updatedAt: new Date().toISOString(),
        }
        return { data: mockDriverVerifications[index] }
      },
      invalidatesTags: (_r, _e, { driverId }) => [{ type: 'DriverVerification', id: driverId }],
    }),
  }),
})

export const {
  useGetIdentityVerificationOverviewQuery,
  useGetDriverVerificationQuery,
  useGetVerificationHistoryQuery,
  useGetIdentityVerificationSettingsQuery,
  useUpdateIdentityVerificationSettingsMutation,
  useRequestReVerificationMutation,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
  useUpdateVerificationSecurityMutation,
} = driverVerificationApi

export { IDENTITY_STATUS_LABELS, VERIFICATION_SOURCE_LABELS } from '@/services/mock/driverVerificationData'
