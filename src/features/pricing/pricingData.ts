export type PricingRuleType =
  | 'default_surge'
  | 'airport_surge'
  | 'event_surge'
  | 'peak_hour_surge'
  | 'holiday_surge'

export const PRICING_RULE_TYPE_LABELS: Record<PricingRuleType, string> = {
  default_surge: 'Default Surge',
  airport_surge: 'Airport Surge',
  event_surge: 'Event Surge',
  peak_hour_surge: 'Peak Hour Surge',
  holiday_surge: 'Holiday Surge',
}
