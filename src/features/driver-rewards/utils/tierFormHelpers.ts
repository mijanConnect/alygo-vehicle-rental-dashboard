import { applyBenefitRules, createDefaultBenefitRules, parseBenefitRules } from '@/features/driver-rewards/utils/tierConfigHelpers'
import { createDefaultLevel, createTierRequirements } from '@/features/driver-rewards/utils/tierDefaults'
import type { DriverLevel } from '@/types/driverRewards'
import type { TierFormValues } from '@/types/tierManagement'

export const defaultTierFormValues = (): TierFormValues => ({
  label: '',
  level: 1,
  tierColor: '#6366f1',
  status: 'active',
  requiredTrips: 0,
  requiredRating: 4.5,
  requiredAcceptanceRate: 85,
  requiredCompletionRate: 92,
  requiredSafetyScore: 85,
  benefitRules: createDefaultBenefitRules(),
  notes: '',
})

export function tierToFormValues(tier: DriverLevel): TierFormValues {
  return {
    label: tier.label,
    level: tier.level,
    tierColor: tier.tierColor,
    status: tier.status,
    requiredTrips: tier.requiredTrips,
    requiredRating: tier.requiredRating,
    requiredAcceptanceRate: tier.requiredAcceptanceRate,
    requiredCompletionRate: tier.requiredCompletionRate,
    requiredSafetyScore: tier.requirements.safetyScore,
    benefitRules: parseBenefitRules(tier.benefits),
    notes: tier.description,
  }
}

export function buildTierPayload(
  values: TierFormValues,
  existing?: DriverLevel,
  sortOrder?: number,
): Omit<DriverLevel, 'id' | 'benefitsCount' | 'driverCount'> {
  const slug = values.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const name = existing?.name ?? slug.replace(/-/g, '_')
  const order = sortOrder ?? values.level
  const template = createDefaultLevel('tmp', name, values.label, values.notes ?? '', order, order, {
    completedTrips: values.requiredTrips,
    driverRating: values.requiredRating,
    acceptanceRate: values.requiredAcceptanceRate,
    safetyScore: values.requiredSafetyScore,
  })
  const baseBenefits = existing?.benefits ?? template.benefits
  const tierBadge = existing?.tierBadge ?? values.label.trim().slice(0, 2).toUpperCase()

  return {
    name,
    slug,
    label: values.label.trim(),
    description: values.notes?.trim() ?? '',
    level: values.level,
    icon: existing?.icon ?? template.icon,
    requiredPoints: existing?.requiredPoints ?? values.requiredTrips * 10,
    requiredRating: values.requiredRating,
    requiredTrips: values.requiredTrips,
    requiredOnlineHours: existing?.requiredOnlineHours ?? 0,
    requiredAcceptanceRate: values.requiredAcceptanceRate,
    requiredCompletionRate: values.requiredCompletionRate,
    requirements: createTierRequirements({
      completedTrips: values.requiredTrips,
      driverRating: values.requiredRating,
      acceptanceRate: values.requiredAcceptanceRate,
      safetyScore: values.requiredSafetyScore,
    }),
    benefits: applyBenefitRules(baseBenefits, values.benefitRules),
    tierColor: values.tierColor,
    tierBadge,
    status: values.status,
    sortOrder: order,
  }
}
