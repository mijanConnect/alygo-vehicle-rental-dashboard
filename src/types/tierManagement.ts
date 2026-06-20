export interface TierDistributionItem {
  label: string
  count: number
  percent: number
}

export interface TierChangeRow {
  id: string
  driverName: string
  previousTier: string
  newTier: string
  changeType: string
  date: string
}

export interface TierBenefitsSummary {
  totalBenefits: number
  assignedAcrossTiers: number
  benefitLabels: string[]
}

export interface TierManagementOverview {
  totalDrivers: number
  activeTiers: number
  promotionCandidates: number
  demotionCandidates: number
  recentTierChanges: TierChangeRow[]
  tierDistribution: TierDistributionItem[]
  benefitsSummary: TierBenefitsSummary
}

export const TIER_ICON_OPTIONS = [
  { value: 'route', label: 'Route' },
  { value: 'zap', label: 'Zap' },
  { value: 'star', label: 'Star' },
  { value: 'gem', label: 'Gem' },
  { value: 'crown', label: 'Crown' },
  { value: 'award', label: 'Award' },
  { value: 'trophy', label: 'Trophy' },
]

import type { TierBenefitRules } from '@/types/driverRewards'

export interface TierFormValues {
  label: string
  level: number
  tierColor: string
  status: 'active' | 'inactive'
  requiredTrips: number
  requiredRating: number
  requiredAcceptanceRate: number
  requiredCompletionRate: number
  requiredSafetyScore: number
  benefitRules: TierBenefitRules
  notes?: string
}

/** @deprecated Use TierFormValues */
export type TierFormModalValues = TierFormValues
