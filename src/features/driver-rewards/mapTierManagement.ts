import type {
  TierBenefits,
  TierItem,
  TierSupportLevel,
  TierWritePayload,
} from '@/redux/api/tiersManagementsApi'
import type { TierBenefitRules } from '@/types/driverRewards'
import type { TierFormValues } from '@/types/tierManagement'

const SUPPORT_LEVELS: TierSupportLevel[] = ['basic', 'vip', 'premium']

export function createDefaultApiBenefitRules(): TierBenefitRules {
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

export function normalizeSupportLevel(value: unknown): TierSupportLevel {
  if (typeof value === 'string' && SUPPORT_LEVELS.includes(value as TierSupportLevel)) {
    return value as TierSupportLevel
  }
  return 'basic'
}

export function apiBenefitsToRules(benefits: TierBenefits): TierBenefitRules {
  return {
    destinationFilter: {
      enabled: Boolean(benefits.destinationFilter?.enabled),
      dailyLimit: Number(benefits.destinationFilter?.dailyLimit ?? 0),
    },
    priorityDispatch: {
      enabled: Boolean(benefits.priorityDispatch?.enabled),
      boostMultiplier: Number(benefits.priorityDispatch?.boostMultiplier ?? 1),
    },
    reservationAccess: {
      enabled: Boolean(benefits.reservationAccess?.enabled),
      maxAdvanceHours: Number(benefits.reservationAccess?.maxAdvanceHours ?? 0),
    },
    premiumRideAccess: {
      enabled: Boolean(benefits.premiumRideAccess?.enabled),
      allowedCategories: [...(benefits.premiumRideAccess?.allowedCategories ?? [])],
    },
    airportQueuePriority: {
      enabled: Boolean(benefits.airportQueuePriority?.enabled),
      priorityPosition: Number(benefits.airportQueuePriority?.priorityPosition ?? 0),
    },
    bonusMultiplier: {
      enabled: Boolean(benefits.bonusMultiplier?.enabled),
      multiplierValue: Number(benefits.bonusMultiplier?.multiplierValue ?? 1),
    },
    vipSupport: {
      enabled: Boolean(benefits.vipSupport?.enabled),
      supportLevel: normalizeSupportLevel(benefits.vipSupport?.supportLevel),
    },
  }
}

export function rulesToApiBenefits(rules: TierBenefitRules = createDefaultApiBenefitRules()): TierBenefits {
  const safe = rules ?? createDefaultApiBenefitRules()
  return {
    destinationFilter: {
      enabled: Boolean(safe.destinationFilter?.enabled),
      dailyLimit: Number(safe.destinationFilter?.dailyLimit ?? 0),
    },
    priorityDispatch: {
      enabled: Boolean(safe.priorityDispatch?.enabled),
      boostMultiplier: Number(safe.priorityDispatch?.boostMultiplier ?? 1),
    },
    reservationAccess: {
      enabled: Boolean(safe.reservationAccess?.enabled),
      maxAdvanceHours: Number(safe.reservationAccess?.maxAdvanceHours ?? 0),
    },
    premiumRideAccess: {
      enabled: Boolean(safe.premiumRideAccess?.enabled),
      allowedCategories: [...(safe.premiumRideAccess?.allowedCategories ?? [])],
    },
    airportQueuePriority: {
      enabled: Boolean(safe.airportQueuePriority?.enabled),
      priorityPosition: Number(safe.airportQueuePriority?.priorityPosition ?? 0),
    },
    bonusMultiplier: {
      enabled: Boolean(safe.bonusMultiplier?.enabled),
      multiplierValue: Number(safe.bonusMultiplier?.multiplierValue ?? 1),
    },
    vipSupport: {
      enabled: Boolean(safe.vipSupport?.enabled),
      supportLevel: normalizeSupportLevel(safe.vipSupport?.supportLevel),
    },
  }
}

export function tierCodeFromName(name?: string | null): string {
  const cleaned = (name ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
  return cleaned.slice(0, 12) || 'tier'
}

export function defaultTierFormValues(nextLevel = 1): TierFormValues {
  return {
    name: '',
    code: '',
    level: nextLevel,
    status: 'active',
    pointsRequired: 0,
    tripsRequired: 0,
    ratingRequired: 0,
    acceptanceRateRequired: 0,
    benefitRules: createDefaultApiBenefitRules(),
  }
}

export function tierToFormValues(tier: TierItem): TierFormValues {
  return {
    name: tier.name,
    code: tier.code,
    level: tier.level,
    status: tier.status === 'inactive' ? 'inactive' : 'active',
    pointsRequired: tier.requirements?.pointsRequired ?? 0,
    tripsRequired: tier.requirements?.tripsRequired ?? 0,
    ratingRequired: tier.requirements?.ratingRequired ?? 0,
    acceptanceRateRequired: tier.requirements?.acceptanceRateRequired ?? 0,
    benefitRules: apiBenefitsToRules(tier.benefits),
  }
}

export function buildTierWritePayload(values: TierFormValues): TierWritePayload {
  const name = (values.name ?? '').trim()
  const code = ((values.code ?? '').trim() || tierCodeFromName(name)).toLowerCase()

  return {
    name,
    code,
    level: values.level,
    requirements: {
      pointsRequired: values.pointsRequired,
      tripsRequired: values.tripsRequired,
      ratingRequired: values.ratingRequired,
      acceptanceRateRequired: values.acceptanceRateRequired,
    },
    benefits: rulesToApiBenefits(values.benefitRules),
  }
}

export function countApiBenefitRules(rules: TierBenefitRules): number {
  return (
    Number(rules.destinationFilter.enabled) +
    Number(rules.priorityDispatch.enabled) +
    Number(rules.reservationAccess.enabled) +
    Number(rules.premiumRideAccess.enabled) +
    Number(rules.airportQueuePriority.enabled) +
    Number(rules.bonusMultiplier.enabled) +
    Number(rules.vipSupport.enabled)
  )
}
