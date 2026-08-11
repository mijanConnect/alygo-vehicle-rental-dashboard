import type { DriverLevel, TierBenefitRules, TierBenefitsConfig, TierVipSupportLevel } from '@/types/driverRewards'

export type BenefitRuleKey = keyof TierBenefitRules

export interface BenefitSummaryLine {
  label: string
  value: string
}

export const PREMIUM_RIDE_CATEGORY_OPTIONS = [
  { value: 'comfort', label: 'Comfort' },
  { value: 'xl', label: 'XL' },
  { value: 'black', label: 'Black' },
  { value: 'black_suv', label: 'Black SUV' },
]

export const VIP_SUPPORT_LEVEL_OPTIONS: Array<{ value: TierVipSupportLevel; label: string }> = [
  { value: 'basic', label: 'Basic' },
  { value: 'vip', label: 'VIP' },
  { value: 'premium', label: 'Premium' },
]

const RESERVATION_ACCESS_LABELS: Record<string, string> = {
  none: 'No Access',
  standard: 'Standard Access',
  priority: 'Priority Access',
  exclusive: 'Exclusive Priority Access',
}

function toSupportLevel(value: unknown): TierVipSupportLevel {
  if (value === 'vip' || value === 'premium' || value === 'basic') return value
  return 'basic'
}

export function formatPremiumCategories(categories: string[]): string {
  if (categories.length === 0) return 'None selected'
  return categories
    .map((c) => PREMIUM_RIDE_CATEGORY_OPTIONS.find((o) => o.value === c)?.label ?? c)
    .join(', ')
}

export function getBenefitSummaryLines(key: BenefitRuleKey, rules: TierBenefitRules): BenefitSummaryLine[] {
  switch (key) {
    case 'destinationFilter':
      return [{ label: 'Daily Limit', value: String(rules.destinationFilter.dailyLimit) }]
    case 'priorityDispatch':
      return [{ label: 'Boost Multiplier', value: `${rules.priorityDispatch.boostMultiplier.toFixed(2)}x` }]
    case 'reservationAccess':
      return [{ label: 'Advance Booking', value: `${rules.reservationAccess.maxAdvanceHours} Hours` }]
    case 'premiumRideAccess':
      return [{ label: 'Categories', value: formatPremiumCategories(rules.premiumRideAccess.allowedCategories) }]
    case 'airportQueuePriority':
      return [{ label: 'Priority Position', value: String(rules.airportQueuePriority.priorityPosition) }]
    case 'bonusMultiplier':
      return [{ label: 'Multiplier', value: `${rules.bonusMultiplier.multiplierValue.toFixed(2)}x` }]
    case 'vipSupport':
      return [{ label: 'Support Level', value: rules.vipSupport.supportLevel }]
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
  const destinationEnabled =
    benefits.destinationFilterActive ??
    (Boolean(benefits.destinationFiltersUnlimited) ||
      benefits.destinationFilters > 0 ||
      benefits.dailyUsageLimit > 0)

  return {
    destinationFilter: {
      enabled: destinationEnabled,
      dailyLimit: benefits.dailyUsageLimit,
    },
    priorityDispatch: {
      enabled: benefits.flags.priorityDispatch,
      boostMultiplier: Math.max(1, benefits.dispatchPriorityLevel / 2),
    },
    reservationAccess: {
      enabled: benefits.reservationAccess !== 'none' || benefits.advanceBookingAccess,
      maxAdvanceHours: benefits.advanceBookingHours ?? (benefits.reservationAccess === 'none' ? 0 : 12),
    },
    premiumRideAccess: {
      enabled: benefits.flags.premiumRideAccess,
      allowedCategories: benefits.premiumRideCategories ?? (benefits.preferredRideAllocation ? ['comfort', 'xl'] : []),
    },
    airportQueuePriority: {
      enabled: benefits.flags.airportQueuePriority,
      priorityPosition: benefits.airportQueuePriorityLevel ?? Math.max(0, benefits.dispatchPriorityLevel - 1),
    },
    bonusMultiplier: {
      enabled: benefits.bonusMultiplier > 1,
      multiplierValue: benefits.bonusMultiplier,
    },
    vipSupport: {
      enabled: benefits.vipSupportAccess,
      supportLevel: benefits.vipSupportAccess
        ? benefits.customerSupportLevel === 'vip'
          ? 'vip'
          : 'premium'
        : 'basic',
    },
  }
}

export function applyBenefitRules(benefits: TierBenefitsConfig, rules: TierBenefitRules): TierBenefitsConfig {
  const destinationEnabled = rules.destinationFilter.enabled
  const dispatchLevel = rules.priorityDispatch.enabled
    ? Math.max(1, Math.round(rules.priorityDispatch.boostMultiplier * 2))
    : 1

  const merged: Omit<TierBenefitsConfig, 'flags'> & { flags?: TierBenefitsConfig['flags'] } = {
    ...benefits,
    destinationFilters: destinationEnabled ? Math.max(1, rules.destinationFilter.dailyLimit) : 0,
    dailyUsageLimit: rules.destinationFilter.dailyLimit,
    weeklyUsageLimit: rules.destinationFilter.dailyLimit * 7,
    destinationFiltersUnlimited: false,
    destinationFilterActive: destinationEnabled,
    dispatchPriorityLevel: dispatchLevel,
    rideMatchingPriority: dispatchLevel,
    advanceBookingAccess: rules.reservationAccess.enabled,
    advanceBookingHours: rules.reservationAccess.maxAdvanceHours,
    reservationAccess: rules.reservationAccess.enabled
      ? rules.reservationAccess.maxAdvanceHours >= 48
        ? 'exclusive'
        : rules.reservationAccess.maxAdvanceHours >= 24
          ? 'priority'
          : 'standard'
      : 'none',
    preferredRideAllocation: rules.premiumRideAccess.enabled,
    premiumRideCategories: rules.premiumRideAccess.allowedCategories,
    airportQueuePriorityLevel: rules.airportQueuePriority.priorityPosition,
    airportRideBonusEnabled: rules.airportQueuePriority.enabled,
    bonusMultiplier: rules.bonusMultiplier.enabled ? rules.bonusMultiplier.multiplierValue : 1,
    vipSupportAccess: rules.vipSupport.enabled,
    customerSupportLevel:
      rules.vipSupport.enabled && rules.vipSupport.supportLevel !== 'basic'
        ? 'vip'
        : benefits.customerSupportLevel,
  }

  return syncBenefitFlags(merged)
}

export function syncBenefitFlags(
  benefits: Omit<TierBenefitsConfig, 'flags'> & { flags?: TierBenefitsConfig['flags'] },
): TierBenefitsConfig {
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
    labels.push(`Destination Filter (${rules.destinationFilter.dailyLimit}/day)`)
  }
  if (rules.priorityDispatch.enabled) {
    labels.push(`Priority Dispatch (${rules.priorityDispatch.boostMultiplier}x)`)
  }
  if (rules.reservationAccess.enabled) {
    labels.push(`${rules.reservationAccess.maxAdvanceHours}h Advance Booking`)
  }
  if (rules.premiumRideAccess.enabled && rules.premiumRideAccess.allowedCategories.length > 0) {
    labels.push(`Premium Rides (${rules.premiumRideAccess.allowedCategories.join(', ')})`)
  }
  if (rules.airportQueuePriority.enabled) {
    labels.push(`Airport Queue Priority #${rules.airportQueuePriority.priorityPosition}`)
  }
  if (rules.bonusMultiplier.enabled) {
    labels.push(`${rules.bonusMultiplier.multiplierValue}x Bonus Multiplier`)
  }
  if (rules.vipSupport.enabled) {
    labels.push(`VIP Support (${rules.vipSupport.supportLevel})`)
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
    destinationFilter: { enabled: false, dailyLimit: 0 },
    priorityDispatch: { enabled: false, boostMultiplier: 1 },
    reservationAccess: { enabled: false, maxAdvanceHours: 0 },
    premiumRideAccess: { enabled: false, allowedCategories: [] },
    airportQueuePriority: { enabled: false, priorityPosition: 0 },
    bonusMultiplier: { enabled: false, multiplierValue: 1 },
    vipSupport: { enabled: false, supportLevel: 'basic' },
  }
}

export { toSupportLevel }
