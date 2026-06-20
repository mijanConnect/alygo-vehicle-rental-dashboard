import { Ban, CheckCircle, Pencil, Trash2 } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import type { CategoryMappingStatus, VehicleEligibilityStatus } from '@/types/vehicleEligibility'

export function getEligibilityRuleActionItems(status: VehicleEligibilityStatus): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit', icon: Pencil, group: 0 },
    {
      key: 'toggle',
      label: status === 'enabled' ? 'Disable' : 'Enable',
      icon: status === 'enabled' ? Ban : CheckCircle,
      group: 1,
    },
  ]
}

export function getPremiumVehicleActionItems(): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit', icon: Pencil, group: 0 },
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 1 },
  ]
}

export function getCategoryMappingActionItems(status: CategoryMappingStatus): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit Mapping', icon: Pencil, group: 0 },
    {
      key: 'toggle',
      label: status === 'active' ? 'Disable Mapping' : 'Enable Mapping',
      icon: status === 'active' ? Ban : CheckCircle,
      group: 1,
    },
    { key: 'delete', label: 'Delete Mapping', icon: Trash2, danger: true, group: 2 },
  ]
}

export function getEligibilityStatusColor(status: VehicleEligibilityStatus): string {
  return status === 'enabled' ? 'success' : 'default'
}

export function getEligibilityStatusLabel(status: VehicleEligibilityStatus): string {
  return status === 'enabled' ? 'Enabled' : 'Disabled'
}

export function getMappingStatusColor(status: CategoryMappingStatus): string {
  return status === 'active' ? 'success' : 'default'
}

export function getMappingStatusLabel(status: CategoryMappingStatus): string {
  return status === 'active' ? 'Active' : 'Inactive'
}
