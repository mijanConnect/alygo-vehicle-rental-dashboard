export const OPERATIONS_POLICY_TAB_KEYS = ['fare_adjustment', 'refund', 'driver_penalty'] as const

export type OperationsPolicyTabKey = (typeof OPERATIONS_POLICY_TAB_KEYS)[number]

export const OPERATIONS_POLICY_TAB_LABELS: Record<OperationsPolicyTabKey, string> = {
  fare_adjustment: 'Fare Adjustment Rules',
  refund: 'Refund Rules',
  driver_penalty: 'Driver Penalty Rules',
}

export const DEFAULT_OPERATIONS_POLICY_TAB: OperationsPolicyTabKey = 'fare_adjustment'

export function resolveOperationsPolicyTab(tab: string | null): OperationsPolicyTabKey {
  if (!tab) return DEFAULT_OPERATIONS_POLICY_TAB
  if (OPERATIONS_POLICY_TAB_KEYS.includes(tab as OperationsPolicyTabKey)) {
    return tab as OperationsPolicyTabKey
  }
  return DEFAULT_OPERATIONS_POLICY_TAB
}
