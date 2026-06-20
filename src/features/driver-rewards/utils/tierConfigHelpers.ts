import type { DispatchPriorityLevel, DriverLevel, TierBenefitRules, TierBenefitsConfig } from '@/types/driverRewards'

const RESERVATION_ACCESS_LABELS: Record<string, string> = {
  none: 'No Access',
  standard: 'Standard Access',
  priority: 'Priority Access',
  exclusive: 'Exclusive Priority Access',
}

export const DISPATCH_PRIORITY_OPTIONS: Array<{ value: DispatchPriorityLevel; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'highest', label: 'Highest' },
]

export const PREMIUM_RIDE_CATEGORY_OPTIONS = [
  { value: 'comfort', label: 'Comfort' },
  { value: 'xl', label: 'XL' },
  { value: 'black', label: 'Black' },
  { value: 'black_suv', label: 'Black SUV' },
]

const DISPATCH_LEVEL_MAP: Record<DispatchPriorityLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  highest: 5,
}

function dispatchLevelToPriority(level: number): DispatchPriorityLevel {
  if (level >= 5) return 'highest'
  if (level >= 3) return 'high'
  if (level >= 2) return 'medium'
  return 'low'
}

export type BenefitRuleKey = keyof TierBenefitRules

export interface BenefitSummaryLine {
  label: string
  value: string
}

export function formatDispatchPriorityLabel(level: DispatchPriorityLevel): string {
  return DISPATCH_PRIORITY_OPTIONS.find((o) => o.value === level)?.label ?? level
}

export function formatPremiumCategories(categories: string[]): string {
  if (categories.length === 0) return 'None selected'
  return categories
    .map((c) => PREMIUM_RIDE_CATEGORY_OPTIONS.find((o) => o.value === c)?.label ?? c)
    .join(', ')
}

export function getBenefitSummaryLines(key: BenefitRuleKey, rules: TierBenefitRules): BenefitSummaryLine[] {
  switch (key) {
    case 'destinationFilter': {
      if (rules.destinationFilter.unlimited) {
        return [{ label: 'Access', value: 'Unlimited' }]
      }
      return [
        { label: 'Filters Allowed', value: String(rules.destinationFilter.filtersAllowed) },
        { label: 'Daily Limit', value: String(rules.destinationFilter.dailyLimit) },
        { label: 'Weekly Limit', value: String(rules.destinationFilter.weeklyLimit) },
      ]
    }
    case 'priorityDispatch':
      return [{ label: 'Level', value: formatDispatchPriorityLabel(rules.priorityDispatch.priorityLevel) }]
    case 'reservationAccess':
      return [{ label: 'Advance Booking', value: `${rules.reservationAccess.advanceBookingHours} Hours` }]
    case 'premiumRideAccess':
      return [{ label: 'Categories', value: formatPremiumCategories(rules.premiumRideAccess.allowedCategories) }]
    case 'airportQueuePriority':
      return [{ label: 'Queue Level', value: String(rules.airportQueuePriority.queuePriorityLevel) }]
    case 'bonusMultiplier':
      return [{ label: 'Multiplier', value: `${rules.bonusMultiplier.multiplierValue.toFixed(2)}x` }]
    case 'vipSupport':
      return [{ label: 'Support', value: 'Dedicated VIP channel' }]
    default:
      return []
  }
}

export function isBenefitEnabled(key: BenefitRuleKey, rules: TierBenefitRules): boolean {
  return rules[key].enabled
}

export const BENEFIT_CARD_DEFINITIONS: Array<{
  key: BenefitRuleKey
  title: string
  description: string
}> = [
  {
    key: 'destinationFilter',
    title: 'Destination Filter',
    description: 'Filter ride destinations and set usage limits.',
  },
  {
    key: 'priorityDispatch',
    title: 'Priority Dispatch',
    description: 'Priority when matching drivers to requests.',
  },
  {
    key: 'reservationAccess',
    title: 'Reservation Access',
    description: 'Accept scheduled reservations in advance.',
  },
  {
    key: 'premiumRideAccess',
    title: 'Premium Ride Access',
    description: 'Eligible premium ride categories.',
  },
  {
    key: 'airportQueuePriority',
    title: 'Airport Queue Priority',
    description: 'Priority position in airport pickup queues.',
  },
  {
    key: 'bonusMultiplier',
    title: 'Bonus Multiplier',
    description: 'Earnings multiplier on qualifying trips.',
  },
  {
    key: 'vipSupport',
    title: 'VIP Support',
    description: 'Priority access to driver support.',
  },
]

export function formatReservationAccess(access: TierBenefitsConfig['reservationAccess']) {
  return RESERVATION_ACCESS_LABELS[access] ?? access
}

export function parseBenefitRules(benefits: TierBenefitsConfig): TierBenefitRules {
  const unlimited = benefits.destinationFiltersUnlimited ?? false
  const destinationEnabled =
    benefits.destinationFilterActive ??
    (unlimited || benefits.destinationFilters > 0 || benefits.dailyUsageLimit > 0)

  return {
    destinationFilter: {
      enabled: destinationEnabled,
      filtersAllowed: benefits.destinationFilters,
      dailyLimit: benefits.dailyUsageLimit,
      weeklyLimit: benefits.weeklyUsageLimit,
      unlimited,
    },
    priorityDispatch: {
      enabled: benefits.flags.priorityDispatch,
      priorityLevel: dispatchLevelToPriority(benefits.dispatchPriorityLevel),
    },
    reservationAccess: {
      enabled: benefits.reservationAccess !== 'none' || benefits.advanceBookingAccess,
      advanceBookingHours: benefits.advanceBookingHours ?? (benefits.reservationAccess === 'none' ? 0 : 12),
    },
    premiumRideAccess: {
      enabled: benefits.flags.premiumRideAccess,
      allowedCategories: benefits.premiumRideCategories ?? (benefits.preferredRideAllocation ? ['comfort', 'xl'] : []),
    },
    airportQueuePriority: {
      enabled: benefits.flags.airportQueuePriority,
      queuePriorityLevel: benefits.airportQueuePriorityLevel ?? Math.max(1, benefits.dispatchPriorityLevel - 1),
    },
    bonusMultiplier: {
      enabled: benefits.bonusMultiplier > 1,
      multiplierValue: benefits.bonusMultiplier,
    },
    vipSupport: {
      enabled: benefits.vipSupportAccess,
    },
  }
}

export function applyBenefitRules(benefits: TierBenefitsConfig, rules: TierBenefitRules): TierBenefitsConfig {
  const unlimited = rules.destinationFilter.unlimited
  const destinationEnabled = rules.destinationFilter.enabled

  const merged: Omit<TierBenefitsConfig, 'flags'> & { flags?: TierBenefitsConfig['flags'] } = {
    ...benefits,
    destinationFilters: rules.destinationFilter.filtersAllowed,
    dailyUsageLimit: rules.destinationFilter.dailyLimit,
    weeklyUsageLimit: rules.destinationFilter.weeklyLimit,
    destinationFiltersUnlimited: unlimited,
    destinationFilterActive: destinationEnabled,
    dispatchPriorityLevel: rules.priorityDispatch.enabled
      ? DISPATCH_LEVEL_MAP[rules.priorityDispatch.priorityLevel]
      : 1,
    rideMatchingPriority: rules.priorityDispatch.enabled
      ? DISPATCH_LEVEL_MAP[rules.priorityDispatch.priorityLevel]
      : 1,
    advanceBookingAccess: rules.reservationAccess.enabled,
    advanceBookingHours: rules.reservationAccess.advanceBookingHours,
    reservationAccess: rules.reservationAccess.enabled
      ? rules.reservationAccess.advanceBookingHours >= 48
        ? 'exclusive'
        : rules.reservationAccess.advanceBookingHours >= 24
          ? 'priority'
          : 'standard'
      : 'none',
    preferredRideAllocation: rules.premiumRideAccess.enabled,
    premiumRideCategories: rules.premiumRideAccess.allowedCategories,
    airportQueuePriorityLevel: rules.airportQueuePriority.queuePriorityLevel,
    airportRideBonusEnabled: rules.airportQueuePriority.enabled,
    bonusMultiplier: rules.bonusMultiplier.enabled ? rules.bonusMultiplier.multiplierValue : 1,
    vipSupportAccess: rules.vipSupport.enabled,
    customerSupportLevel: rules.vipSupport.enabled ? 'vip' : benefits.customerSupportLevel,
  }

  return syncBenefitFlags(merged)
}

export function syncBenefitFlags(benefits: Omit<TierBenefitsConfig, 'flags'> & { flags?: TierBenefitsConfig['flags'] }): TierBenefitsConfig {
  const flags: TierBenefitsConfig['flags'] = {
    priorityDispatch: benefits.dispatchPriorityLevel >= 2,
    priorityMatching: benefits.rideMatchingPriority >= 2,
    premiumRideAccess: benefits.preferredRideAllocation,
    airportQueuePriority: (benefits.airportQueuePriorityLevel ?? 0) >= 1 || benefits.dispatchPriorityLevel >= 3,
    eventQueuePriority: benefits.dispatchPriorityLevel >= 4,
    vipRideAccess: benefits.vipSupportAccess,
    luxuryRideAccess: benefits.reservationAccess === 'exclusive',
    bonusMultiplier: benefits.bonusMultiplier,
    surgeMultiplier: benefits.peakHourMultiplier,
    dedicatedSupport: benefits.customerSupportLevel !== 'standard',
    reducedPlatformFees: benefits.dispatchPriorityLevel >= 4 ? 6 : benefits.dispatchPriorityLevel >= 2 ? 2 : 0,
    reservationPriority: benefits.reservationAccess !== 'none',
    earlyFeatureAccess: benefits.promotionEligibility,
    ...benefits.flags,
  }
  return { ...benefits, flags } as TierBenefitsConfig
}

export function deriveActiveBenefitLabels(level: DriverLevel): string[] {
  const rules = parseBenefitRules(level.benefits)
  const labels: string[] = []

  if (rules.destinationFilter.enabled) {
    labels.push(
      rules.destinationFilter.unlimited
        ? 'Unlimited Destination Filters'
        : `${rules.destinationFilter.filtersAllowed} Destination Filters`,
    )
  }
  if (rules.priorityDispatch.enabled) {
    labels.push(`Priority Dispatch (${rules.priorityDispatch.priorityLevel})`)
  }
  if (rules.reservationAccess.enabled) {
    labels.push(`${rules.reservationAccess.advanceBookingHours}h Advance Booking`)
  }
  if (rules.premiumRideAccess.enabled && rules.premiumRideAccess.allowedCategories.length > 0) {
    labels.push(`Premium Rides (${rules.premiumRideAccess.allowedCategories.join(', ')})`)
  }
  if (rules.airportQueuePriority.enabled) {
    labels.push(`Airport Queue Priority L${rules.airportQueuePriority.queuePriorityLevel}`)
  }
  if (rules.bonusMultiplier.enabled) {
    labels.push(`${rules.bonusMultiplier.multiplierValue}x Bonus Multiplier`)
  }
  if (rules.vipSupport.enabled) {
    labels.push('VIP Support')
  }

  return labels
}

export function deriveLockedBenefitLabels(current: DriverLevel, next?: DriverLevel): string[] {
  if (!next) return []
  const currentLabels = new Set(deriveActiveBenefitLabels(current))
  return deriveActiveBenefitLabels(next).filter((label) => !currentLabels.has(label))
}

export function countActiveBenefitRules(rules: TierBenefitRules): number {
  let count = 0
  if (rules.destinationFilter.enabled) count += 1
  if (rules.priorityDispatch.enabled) count += 1
  if (rules.reservationAccess.enabled) count += 1
  if (rules.premiumRideAccess.enabled) count += 1
  if (rules.airportQueuePriority.enabled) count += 1
  if (rules.bonusMultiplier.enabled) count += 1
  if (rules.vipSupport.enabled) count += 1
  return count
}

export function createDefaultBenefitRules(): TierBenefitRules {
  return {
    destinationFilter: {
      enabled: false,
      filtersAllowed: 0,
      dailyLimit: 0,
      weeklyLimit: 0,
      unlimited: false,
    },
    priorityDispatch: { enabled: false, priorityLevel: 'low' },
    reservationAccess: { enabled: false, advanceBookingHours: 0 },
    premiumRideAccess: { enabled: false, allowedCategories: [] },
    airportQueuePriority: { enabled: false, queuePriorityLevel: 1 },
    bonusMultiplier: { enabled: false, multiplierValue: 1 },
    vipSupport: { enabled: false },
  }
}
