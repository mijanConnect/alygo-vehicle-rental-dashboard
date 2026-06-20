import { RIDE_CATEGORY_LABELS } from '@/constants'
import type { RideCategory } from '@/types'
import type { RideCategoryDefinition } from '@/types/rideCategoryManagement'

export const POLICY_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const

export function getRideCategoryLabel(
  slug: string,
  categories: RideCategoryDefinition[] = [],
): string {
  const match = categories.find((category) => category.slug === slug)
  if (match) return match.name
  const known = RIDE_CATEGORY_LABELS[slug as RideCategory]
  return known ?? slug.replace(/_/g, ' ')
}
