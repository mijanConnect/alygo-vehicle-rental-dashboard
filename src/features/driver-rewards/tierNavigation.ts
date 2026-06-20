export const TIER_TAB_KEYS = ['overview', 'configuration'] as const

export type TierTabKey = (typeof TIER_TAB_KEYS)[number]

export const TIER_TAB_LABELS: Record<TierTabKey, string> = {
  overview: 'Overview',
  configuration: 'Tier Configuration',
}

export const DEFAULT_TIER_TAB: TierTabKey = 'overview'

const LEGACY_TIER_TAB_MAP: Record<string, TierTabKey> = {
  benefits: 'configuration',
  'destination-filters': 'configuration',
  'filter-usage': 'configuration',
  'destination-filter-analytics': 'overview',
  'filter-analytics': 'overview',
  analytics: 'overview',
}

export function resolveTierTab(tab: string | null): TierTabKey {
  if (!tab) return DEFAULT_TIER_TAB
  if (TIER_TAB_KEYS.includes(tab as TierTabKey)) return tab as TierTabKey
  return LEGACY_TIER_TAB_MAP[tab] ?? DEFAULT_TIER_TAB
}

export function tierTabPath(tab: TierTabKey) {
  return `/drivers/tiers?tab=${tab}`
}
