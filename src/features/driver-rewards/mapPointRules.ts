import type {
  PointRuleActionType,
  PointRuleEventType,
  PointRuleItem,
  PointRuleWritePayload,
} from '@/redux/api/driverRewardManagementApi'

export interface PointRuleRow {
  id: string
  name: string
  eventType: PointRuleEventType
  points: number
  actionType: PointRuleActionType
  status: string
  createdAt: string
  updatedAt?: string
}

export interface PointRuleFormValues {
  name: string
  eventType: PointRuleEventType
  points: number
}

export const POINT_RULE_EVENT_TYPE_OPTIONS: Array<{ label: string; value: PointRuleEventType }> = [
  { label: 'Ride Completed', value: 'ride_completed' },
  { label: '5-Star Rating', value: 'five_star_rating' },
  { label: 'Airport Ride', value: 'airport_ride' },
  { label: 'Scheduled Ride', value: 'scheduled_ride' },
  { label: 'Peak Hour Ride', value: 'peak_hour_ride' },
  { label: 'Referral Completed', value: 'referral_completed' },
  { label: 'Accepted Ride Cancelled', value: 'accepted_ride_cancelled' },
  { label: 'Policy Violation', value: 'policy_violation' },
  { label: 'Admin Override', value: 'admin_override' },
]

export const POINT_RULE_EVENT_TYPE_LABELS: Record<PointRuleEventType, string> =
  Object.fromEntries(
    POINT_RULE_EVENT_TYPE_OPTIONS.map(({ label, value }) => [value, label]),
  ) as Record<PointRuleEventType, string>

export function defaultPointRuleFormValues(actionType: PointRuleActionType): PointRuleFormValues {
  return {
    name: '',
    eventType: actionType === 'earning' ? 'ride_completed' : 'accepted_ride_cancelled',
    points: actionType === 'earning' ? 5 : 10,
  }
}

export function mapPointRuleItem(item: PointRuleItem): PointRuleRow {
  return {
    id: item._id,
    name: item.name,
    eventType: item.eventType,
    points: item.points,
    actionType: item.actionType,
    status: item.status,
    createdAt: item.createdAt ?? '',
    updatedAt: item.updatedAt,
  }
}

export function pointRuleToFormValues(row: PointRuleRow): PointRuleFormValues {
  return {
    name: row.name,
    eventType: row.eventType,
    points: Math.abs(row.points),
  }
}

export function buildPointRuleWritePayload(
  values: PointRuleFormValues,
  actionType: PointRuleActionType,
): PointRuleWritePayload {
  const points =
    actionType === 'deduction' ? -Math.abs(values.points) : Math.abs(values.points)

  return {
    name: values.name.trim(),
    eventType: values.eventType,
    points,
    actionType,
  }
}

export function formatPointRulePoints(points: number, actionType: PointRuleActionType): string {
  const absolute = Math.abs(points)
  return actionType === 'deduction' ? `-${absolute}` : `+${absolute}`
}
