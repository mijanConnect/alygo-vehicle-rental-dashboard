export const PRICING_TAB_KEYS = ['rules'] as const

export type PricingTabKey = (typeof PRICING_TAB_KEYS)[number]

export const PRICING_TAB_LABELS: Record<PricingTabKey, string> = {
  rules: 'Pricing Rules',
}

export const DEFAULT_PRICING_TAB: PricingTabKey = 'rules'

export function pricingTabPath(tab: PricingTabKey = DEFAULT_PRICING_TAB) {
  return tab === 'rules' ? '/pricing' : `/pricing?tab=${tab}`
}

export const LEGACY_PRICING_PATHS: Record<string, PricingTabKey> = {
  '/pricing/rules': 'rules',
  '/pricing/surge-zones': 'rules',
  '/pricing/surge-history': 'rules',
}
