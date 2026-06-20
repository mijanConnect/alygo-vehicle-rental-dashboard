import type { ChartPoint, SurgeZone } from '@/types'

export type PricingRuleType =
  | 'default_surge'
  | 'airport_surge'
  | 'event_surge'
  | 'peak_hour_surge'
  | 'holiday_surge'

export interface PricingRule {
  id: string
  name: string
  ruleType: PricingRuleType
  demandThreshold: number
  supplyThreshold: number
  minMultiplier: number
  maxMultiplier: number
  status: 'active' | 'inactive'
}

export const PRICING_RULE_TYPE_LABELS: Record<PricingRuleType, string> = {
  default_surge: 'Default Surge',
  airport_surge: 'Airport Surge',
  event_surge: 'Event Surge',
  peak_hour_surge: 'Peak Hour Surge',
  holiday_surge: 'Holiday Surge',
}

export const MOCK_PRICING_RULES: PricingRule[] = [
  {
    id: 'PR-1',
    name: 'Default Surge',
    ruleType: 'default_surge',
    demandThreshold: 80,
    supplyThreshold: 40,
    minMultiplier: 1.2,
    maxMultiplier: 3.5,
    status: 'active',
  },
  {
    id: 'PR-2',
    name: 'Airport Premium',
    ruleType: 'airport_surge',
    demandThreshold: 70,
    supplyThreshold: 50,
    minMultiplier: 1.5,
    maxMultiplier: 4.0,
    status: 'active',
  },
  {
    id: 'PR-3',
    name: 'Event Surge',
    ruleType: 'event_surge',
    demandThreshold: 90,
    supplyThreshold: 30,
    minMultiplier: 2.0,
    maxMultiplier: 5.0,
    status: 'active',
  },
  {
    id: 'PR-4',
    name: 'Peak Hour Surge',
    ruleType: 'peak_hour_surge',
    demandThreshold: 75,
    supplyThreshold: 45,
    minMultiplier: 1.3,
    maxMultiplier: 2.8,
    status: 'active',
  },
  {
    id: 'PR-5',
    name: 'Holiday Surge',
    ruleType: 'holiday_surge',
    demandThreshold: 85,
    supplyThreshold: 35,
    minMultiplier: 1.8,
    maxMultiplier: 4.5,
    status: 'inactive',
  },
]

export const SURGE_FREQUENCY_DATA: ChartPoint[] = [
  { label: 'Mon', value: 42 },
  { label: 'Tue', value: 38 },
  { label: 'Wed', value: 51 },
  { label: 'Thu', value: 47 },
  { label: 'Fri', value: 68 },
  { label: 'Sat', value: 72 },
  { label: 'Sun', value: 55 },
]

export const MULTIPLIER_TREND_DATA: ChartPoint[] = [
  { label: 'Mon', value: 2.1 },
  { label: 'Tue', value: 1.8 },
  { label: 'Wed', value: 2.4 },
  { label: 'Thu', value: 2.9 },
  { label: 'Fri', value: 3.2 },
  { label: 'Sat', value: 3.8 },
  { label: 'Sun', value: 2.5 },
]

export const REVENUE_IMPACT_DATA: ChartPoint[] = [
  { label: 'Mon', value: 12400 },
  { label: 'Tue', value: 9800 },
  { label: 'Wed', value: 15200 },
  { label: 'Thu', value: 18600 },
  { label: 'Fri', value: 22400 },
  { label: 'Sat', value: 28100 },
  { label: 'Sun', value: 16800 },
]

export function computeSurgeAnalytics(zones: SurgeZone[]) {
  const activeZones = zones.filter((z) => z.active)
  const avgMultiplier =
    activeZones.length > 0
      ? activeZones.reduce((sum, z) => sum + z.multiplier, 0) / activeZones.length
      : 0

  const mostActive = [...zones].sort((a, b) => b.demand - a.demand).slice(0, 5)

  return {
    averageSurgeMultiplier: avgMultiplier,
    revenueImpact: REVENUE_IMPACT_DATA.reduce((sum, d) => sum + d.value, 0),
    surgeEvents: SURGE_FREQUENCY_DATA.reduce((sum, d) => sum + d.value, 0),
    mostActiveZones: mostActive,
  }
}
