import {
  CheckCircle,
  Bell,
  Eye,
  FileText,
  Pencil,
  Power,
  PowerOff,
  Trash2,
  XCircle,
} from 'lucide-react'
import type { ActionMenuItem, DetailField } from '@/components/admin/types'
import type { BackgroundCheckFeeConfig } from '@/types/backgroundCheckFee'
import type {
  BackgroundCheckRecord,
  DocumentMonitorRecord,
  DriverRestrictionRecord,
} from '@/types/complianceCenter'
import { formatDate, formatDateTime } from '@/utils/format'

export function getBackgroundCheckActionItems(record: BackgroundCheckRecord): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'view-report', label: 'View Report', icon: FileText, group: 1 },
  ]
  if (record.status === 'pending' || record.status === 'in_review') {
    items.push(
      { key: 'approve', label: 'Approve', icon: CheckCircle, group: 2 },
      { key: 'reject', label: 'Reject', icon: XCircle, danger: true, group: 2 },
    )
  }
  return items
}

export function buildBackgroundCheckDetailFields(record: BackgroundCheckRecord): DetailField[] {
  return [
    { label: 'Driver', value: record.driverName },
    { label: 'Provider', value: record.provider },
    { label: 'Status', value: record.status.replace('_', ' ') },
    { label: 'Submitted', value: formatDateTime(record.submittedAt) },
    { label: 'Completed', value: record.completedAt ? formatDateTime(record.completedAt) : '—' },
    {
      label: 'Report Summary',
      value:
        'No adverse findings on motor vehicle record. Criminal history clear. Employment verification pending.',
    },
  ]
}

export function getDocumentMonitorActionItems(): ActionMenuItem[] {
  return [
    { key: 'view', label: 'View', icon: Eye, group: 1 },
    { key: 'notify', label: 'Notify Driver', icon: Bell, group: 2 },
  ]
}

export function buildDocumentDetailFields(record: DocumentMonitorRecord): DetailField[] {
  return [
    { label: 'Driver', value: record.driverName },
    { label: 'Document Type', value: record.documentType },
    { label: 'Expiry Date', value: record.expiryDate ? formatDate(record.expiryDate) : '—' },
    {
      label: 'Days Remaining',
      value: record.daysRemaining != null ? String(record.daysRemaining) : '—',
    },
    { label: 'Status', value: record.status },
  ]
}

export function getComplianceFeeActionItems(record: BackgroundCheckFeeConfig): ActionMenuItem[] {
  const items: ActionMenuItem[] = [{ key: 'edit', label: 'Edit', icon: Pencil, group: 1 }]
  if (record.status === 'active') {
    items.push({ key: 'disable', label: 'Disable', icon: PowerOff, danger: true, group: 2 })
  } else {
    items.push({ key: 'enable', label: 'Enable', icon: Power, group: 2 })
  }
  return items
}

export function getDriverRestrictionActionItems(): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit Restriction', icon: Pencil, group: 1 },
    { key: 'remove', label: 'Remove Restriction', icon: Trash2, danger: true, group: 2 },
  ]
}

export function buildRestrictionDetailFields(record: DriverRestrictionRecord): DetailField[] {
  return [
    { label: 'Driver', value: record.driverName },
    { label: 'Reason', value: record.reason },
    { label: 'Restricted Categories', value: record.restrictedCategories.join(', ') },
    {
      label: 'Restriction End Date',
      value: record.restrictionEndDate ? formatDate(record.restrictionEndDate) : 'Indefinite',
    },
    { label: 'Status', value: record.status },
  ]
}
