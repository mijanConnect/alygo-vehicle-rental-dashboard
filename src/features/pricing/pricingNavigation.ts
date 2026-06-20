export const PRICING_TAB_KEYS = ['rules', 'zones', 'analytics'] as const

export type PricingTabKey = (typeof PRICING_TAB_KEYS)[number]

export const PRICING_TAB_LABELS: Record<PricingTabKey, string> = {
  rules: 'Pricing Rules',
  zones: 'Zone Pricing',
  analytics: 'Surge Analytics',
}

export const DEFAULT_PRICING_TAB: PricingTabKey = 'rules'

export function pricingTabPath(tab: PricingTabKey) {
  return `/pricing?tab=${tab}`
}

export const LEGACY_PRICING_PATHS: Record<string, PricingTabKey> = {
  '/pricing/rules': 'rules',
  '/pricing/surge-zones': 'zones',
  '/pricing/surge-history': 'analytics',
}
