import { Ban, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import type { BannerItem, BannerStatus } from '@/redux/api/bannerManageApi'

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') ?? ''

export const BANNER_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export function resolveBannerImageUrl(path?: string | null) {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

export function getBannerActionItems(record: BannerItem): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit', icon: Pencil, group: 0 },
    {
      key: 'toggle',
      label: record.status === 'active' ? 'Deactivate' : 'Activate',
      icon: record.status === 'active' ? Ban : CheckCircle2,
      group: 1,
    },
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 },
  ]
}

export function getBannerStatusColor(status: BannerStatus): string {
  return status === 'active' ? 'success' : 'default'
}

export function getBannerStatusLabel(status: BannerStatus): string {
  return status === 'active' ? 'Active' : 'Inactive'
}
