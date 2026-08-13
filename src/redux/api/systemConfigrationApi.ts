import { baseApi } from '@/redux/baseApi'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface DriverMatchingConfig {
  initialSearchRadiusKm: number
  radiusExpansionDistanceKm: number
  driverVisibilityDurationSeconds: number
  rideRequestLifetimeSeconds: number
  maxSearchRadiusKm: number
}

export interface TrackingConfig {
  minLocationUpdateIntervalSeconds: number
  minMovementDistanceMeters: number
  maxGpsAccuracyToleranceMeters: number
  arrivalRadiusMeters: number
  etaRefreshIntervalSeconds: number
  averageSpeedKmh: number
  enableSocketOptimization: boolean
}

export interface ReservationConfig {
  enabled: boolean
  minAdvanceMinutes: number
  maxAdvanceDays: number
  driverVisibleBeforeMinutes: number
  driverAssignmentTimeoutMinutes: number
  reminder24h: boolean
  reminder1h: boolean
  reminder30m: boolean
  reminder15m: boolean
}

export interface LostFoundConfig {
  enabled: boolean
  reportWindowDays: number
  maxFiles: number
  maxFileSizeMb: number
  defaultDeliveryFee: number
  returnConfirmationHours: number
  autoCloseDays: number
}

export interface PassengerReferralConfig {
  enabled: boolean
  rewardAmount: number
  rewardCurrency: string
  qualificationType: string
  requiredCompletedTrips: number
  qualificationDays: number
  allowMultipleRewards: boolean
  maximumRewardsPerUser: number
  autoRewardEnabled: boolean
  shareInstructions: string
  rewardTerms: string
  generalNotes: string
}

export interface DriverReferralConfig {
  enabled: boolean
  rewardAmount: number
  rewardCurrency: string
  requiredCompletedTrips: number
  qualificationDays: number
  payoutDelayHours: number
  autoRewardEnabled: boolean
  maximumRewardsPerDriver: number
  shareInstructions: string
  termsAndConditions: string
  generalNotes: string
}

export interface ReferralConfig {
  passenger: PassengerReferralConfig
  driver: DriverReferralConfig
}

export interface DriverRewardsConfig {
  enabled: boolean
  tierPromotion: boolean
  autoDowngrade: boolean
  dailyQuotaResetTime: string
  timezone: string
  destinationFilterRadiusDefault: number
}

export interface SystemConfigrationWritePayload {
  driverMatching: DriverMatchingConfig
  tracking: TrackingConfig
  reservation: ReservationConfig
  lostFound: LostFoundConfig
  referral: ReferralConfig
  driverRewards: DriverRewardsConfig
}

export interface SystemConfigrationItem extends SystemConfigrationWritePayload {
  _id?: string
  aiSupport?: Record<string, unknown>
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export const DEFAULT_SYSTEM_CONFIGURATION: SystemConfigrationWritePayload = {
  driverMatching: {
    initialSearchRadiusKm: 5,
    radiusExpansionDistanceKm: 3,
    driverVisibilityDurationSeconds: 60,
    rideRequestLifetimeSeconds: 300,
    maxSearchRadiusKm: 50,
  },
  tracking: {
    minLocationUpdateIntervalSeconds: 2,
    minMovementDistanceMeters: 10,
    maxGpsAccuracyToleranceMeters: 50,
    arrivalRadiusMeters: 30,
    etaRefreshIntervalSeconds: 10,
    averageSpeedKmh: 40,
    enableSocketOptimization: true,
  },
  reservation: {
    enabled: true,
    minAdvanceMinutes: 30,
    maxAdvanceDays: 30,
    driverVisibleBeforeMinutes: 60,
    driverAssignmentTimeoutMinutes: 5,
    reminder24h: true,
    reminder1h: true,
    reminder30m: true,
    reminder15m: true,
  },
  lostFound: {
    enabled: true,
    reportWindowDays: 15,
    maxFiles: 7,
    maxFileSizeMb: 10,
    defaultDeliveryFee: 0,
    returnConfirmationHours: 48,
    autoCloseDays: 30,
  },
  referral: {
    passenger: {
      enabled: true,
      rewardAmount: 20,
      rewardCurrency: 'USD',
      qualificationType: 'rides',
      requiredCompletedTrips: 1,
      qualificationDays: 30,
      allowMultipleRewards: false,
      maximumRewardsPerUser: 5,
      autoRewardEnabled: true,
      shareInstructions: 'Send your unique referral code or link to friends.',
      rewardTerms: 'Reward is granted once the referred passenger completes 1 trip.',
      generalNotes: 'Referrals are subject to verification.',
    },
    driver: {
      enabled: true,
      rewardAmount: 100,
      rewardCurrency: 'USD',
      requiredCompletedTrips: 10,
      qualificationDays: 30,
      payoutDelayHours: 0,
      autoRewardEnabled: true,
      maximumRewardsPerDriver: 10,
      shareInstructions: 'Send your unique referral code or link to drivers.',
      termsAndConditions: 'The referee driver must complete 10 rides within 30 days.',
      generalNotes: 'Payouts are processed within 24 hours.',
    },
  },
  driverRewards: {
    enabled: true,
    tierPromotion: true,
    autoDowngrade: true,
    dailyQuotaResetTime: '00:00',
    timezone: 'America/Los_Angeles',
    destinationFilterRadiusDefault: 5,
  },
}

export function toSystemConfigWritePayload(
  data: Partial<SystemConfigrationItem> | undefined,
): SystemConfigrationWritePayload {
  const source = data ?? {}
  return {
    driverMatching: {
      ...DEFAULT_SYSTEM_CONFIGURATION.driverMatching,
      ...(source.driverMatching ?? {}),
    },
    tracking: {
      ...DEFAULT_SYSTEM_CONFIGURATION.tracking,
      ...(source.tracking ?? {}),
    },
    reservation: {
      ...DEFAULT_SYSTEM_CONFIGURATION.reservation,
      ...(source.reservation ?? {}),
    },
    lostFound: {
      ...DEFAULT_SYSTEM_CONFIGURATION.lostFound,
      ...(source.lostFound ?? {}),
    },
    referral: {
      passenger: {
        ...DEFAULT_SYSTEM_CONFIGURATION.referral.passenger,
        ...(source.referral?.passenger ?? {}),
      },
      driver: {
        ...DEFAULT_SYSTEM_CONFIGURATION.referral.driver,
        ...(source.referral?.driver ?? {}),
      },
    },
    driverRewards: {
      ...DEFAULT_SYSTEM_CONFIGURATION.driverRewards,
      ...(source.driverRewards ?? {}),
    },
  }
}

export const systemConfigrationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemConfigration: builder.query<SystemConfigrationItem, void>({
      query: () => ({
        url: '/system-configurations',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<SystemConfigrationItem>) => response.data,
      providesTags: ['SystemConfiguration'],
    }),

    updateSystemConfigration: builder.mutation<
      SystemConfigrationItem,
      SystemConfigrationWritePayload
    >({
      query: (body) => ({
        url: '/system-configurations',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<SystemConfigrationItem>) => response.data,
      invalidatesTags: ['SystemConfiguration'],
    }),
  }),
})

export const {
  useGetSystemConfigrationQuery,
  useUpdateSystemConfigrationMutation,
} = systemConfigrationApi
