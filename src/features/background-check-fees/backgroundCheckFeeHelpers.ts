import { Eye, Pencil, Power, PowerOff } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import type { BackgroundCheckFeeConfig } from '@/types/backgroundCheckFee'
import { CATEGORY_LABELS } from '@/services/backgroundCheckFeeApi'
import type { DetailField } from '@/components/admin/types'
import { formatCurrency } from '@/utils/format'

export function getFeeActionItems(record: BackgroundCheckFeeConfig): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'view', label: 'View', icon: Eye },
    { key: 'edit', label: 'Edit', icon: Pencil, group: 1 },
  ]
  if (record.status === 'active') {
    items.push({ key: 'deactivate', label: 'Deactivate', icon: PowerOff, danger: true, group: 2 })
  } else {
    items.push({ key: 'activate', label: 'Activate', icon: Power, group: 2 })
  }
  return items
}

export function categoryLabel(category: string) {
  return CATEGORY_LABELS[category] ?? category
}

export function buildFeeDetailFields(record: BackgroundCheckFeeConfig): DetailField[] {
  return [
    { label: 'Fee Name', value: record.feeName },
    { label: 'Amount', value: formatCurrency(record.amount) },
    { label: 'State', value: record.state },
    { label: 'Category', value: categoryLabel(record.category) },
    { label: 'Refundable', value: record.refundable ? 'Yes' : 'No' },
    { label: 'Status', value: record.status === 'active' ? 'Active' : 'Inactive' },
  ]
}
