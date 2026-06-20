import { Pencil, Power, PowerOff, Trash2 } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import type { OperationsPolicyRule } from '@/types/operationsPolicy'
import { CATEGORY_LABELS } from '@/services/operationsPolicyApi'

export function getPolicyActionItems(record: OperationsPolicyRule): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'edit', label: 'Edit Rule', icon: Pencil },
  ]
  if (record.status === 'active') {
    items.push({ key: 'disable', label: 'Disable', icon: PowerOff, group: 1 })
  } else {
    items.push({ key: 'enable', label: 'Enable', icon: Power, group: 1 })
  }
  items.push({ key: 'delete', label: 'Delete Rule', icon: Trash2, danger: true, group: 2 })
  return items
}

export function buildPolicyFields(record: OperationsPolicyRule) {
  return [
    { label: 'Policy Name', value: record.name },
    { label: 'Category', value: CATEGORY_LABELS[record.category] },
    { label: 'Description', value: record.description },
    { label: 'Value', value: record.value },
    { label: 'Status', value: record.status },
    { label: 'Last Updated', value: new Date(record.lastUpdated).toLocaleString() },
    { label: 'Updated By', value: record.updatedBy },
  ]
}
