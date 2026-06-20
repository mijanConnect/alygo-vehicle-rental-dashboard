import { Eye, Pencil, Power, PowerOff, Trash2 } from 'lucide-react'
import type { ActionMenuItem, DetailField } from '@/components/admin/types'
import type { useAdminActions } from '@/hooks/useAdminActions'

type AdminActions = ReturnType<typeof useAdminActions>
import type {
  CancellationFee,
  CancellationReason,
  CancellationReasonRow,
  CityCancellationPolicy,
  NoShowPolicy,
} from '@/types/cancellation'
import {
  getRideCategoryLabel,
  POLICY_STATUS_OPTIONS,
} from '@/features/cancellations/cancellationPolicyHelpers'
import { formatCurrency } from '@/utils/format'

export function getReasonActionItems(record: CancellationReason): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'view', label: 'View', icon: Eye },
    { key: 'edit', label: 'Edit', icon: Pencil, group: 1 },
  ]
  if (record.status === 'active') {
    items.push({ key: 'deactivate', label: 'Deactivate', icon: PowerOff, group: 2 })
  } else {
    items.push({ key: 'activate', label: 'Activate', icon: Power, group: 2 })
  }
  items.push({ key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 3 })
  return items
}

export function getFeeActionItems(record: CancellationFee): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'view', label: 'View', icon: Eye },
    { key: 'edit', label: 'Edit Policy', icon: Pencil, group: 1 },
  ]
  if (record.status === 'active') {
    items.push({ key: 'deactivate', label: 'Disable', icon: PowerOff, group: 2 })
  } else {
    items.push({ key: 'activate', label: 'Enable', icon: Power, group: 2 })
  }
  return items
}

export function getNoShowActionItems(record: NoShowPolicy): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'view', label: 'View', icon: Eye },
    { key: 'edit', label: 'Edit Policy', icon: Pencil, group: 1 },
  ]
  if (record.status === 'active') {
    items.push({ key: 'deactivate', label: 'Deactivate', icon: PowerOff, group: 2 })
  } else {
    items.push({ key: 'activate', label: 'Activate', icon: Power, group: 2 })
  }
  return items
}

export function getCityPolicyActionItems(): ActionMenuItem[] {
  return [
    { key: 'view', label: 'View', icon: Eye },
    { key: 'edit', label: 'Edit Policy', icon: Pencil, group: 1 },
    { key: 'delete', label: 'Delete Policy', icon: Trash2, danger: true, group: 2 },
  ]
}

function statusLabel(status: string) {
  return status === 'active' ? 'Active' : 'Inactive'
}

export function getReasonUserTypeLabel(userType: 'passenger' | 'driver') {
  return userType === 'passenger' ? 'Passenger' : 'Driver'
}

export function buildReasonDetailFields(record: CancellationReasonRow): DetailField[] {
  return [
    { label: 'Reason Name', value: record.name },
    { label: 'User Type', value: getReasonUserTypeLabel(record.userType) },
    { label: 'Sort Order', value: String(record.sortOrder) },
    { label: 'Status', value: statusLabel(record.status) },
  ]
}

export { getRideCategoryLabel, POLICY_STATUS_OPTIONS }

export function buildFeeDetailFields(
  record: CancellationFee,
  categories: Parameters<typeof getRideCategoryLabel>[1] = [],
): DetailField[] {
  return [
    { label: 'Ride Category', value: getRideCategoryLabel(record.rideCategory, categories) },
    { label: 'Cancellation Fee', value: formatCurrency(record.fee) },
    { label: 'Driver Compensation', value: formatCurrency(record.driverCompensation) },
    { label: 'Status', value: statusLabel(record.status) },
  ]
}

export function buildNoShowDetailFields(
  record: NoShowPolicy,
  categories: Parameters<typeof getRideCategoryLabel>[1] = [],
): DetailField[] {
  return [
    { label: 'Ride Category', value: getRideCategoryLabel(record.rideCategory, categories) },
    { label: 'Wait Time', value: `${record.waitTimeMinutes} minutes` },
    { label: 'No Show Fee', value: formatCurrency(record.noShowFee) },
    { label: 'Driver Compensation', value: formatCurrency(record.driverCompensation) },
    { label: 'Status', value: statusLabel(record.status) },
  ]
}

export function buildCityPolicyDetailFields(
  record: CityCancellationPolicy,
  categories: Parameters<typeof getRideCategoryLabel>[1] = [],
): DetailField[] {
  return [
    { label: 'Country', value: 'United States' },
    { label: 'State', value: record.state },
    { label: 'City', value: record.city },
    { label: 'Ride Category', value: getRideCategoryLabel(record.rideCategory, categories) },
    { label: 'Cancellation Fee', value: formatCurrency(record.cancellationFee) },
    { label: 'No Show Fee', value: formatCurrency(record.noShowFee) },
    { label: 'Wait Time', value: `${record.waitTime} minutes` },
    { label: 'Status', value: statusLabel(record.status) },
  ]
}

export function openPolicyDrawer(
  title: string,
  fields: DetailField[],
  adminActions: AdminActions,
) {
  adminActions.openDrawer(title, fields)
}
