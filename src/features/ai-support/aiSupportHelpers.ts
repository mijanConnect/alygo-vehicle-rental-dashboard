import { Pencil, Trash2 } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import {
  AI_KNOWLEDGE_CATEGORY,
  AI_KNOWLEDGE_MODULE,
  AI_KNOWLEDGE_TAG,
  type AiSupportItem,
} from '@/redux/api/aiSupportApi'

function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const AI_SUPPORT_MODULE_OPTIONS = Object.values(AI_KNOWLEDGE_MODULE).map((value) => ({
  label: value,
  value,
}))

export const AI_SUPPORT_CATEGORY_OPTIONS = Object.values(AI_KNOWLEDGE_CATEGORY).map((value) => ({
  label: titleCase(value),
  value,
}))

export const AI_SUPPORT_TAG_OPTIONS = Object.values(AI_KNOWLEDGE_TAG).map((value) => ({
  label: titleCase(value),
  value,
}))

export const AI_SUPPORT_VISIBILITY_OPTIONS = [
  { label: 'Driver', value: 'driver' },
  { label: 'Passenger', value: 'passenger' },
  { label: 'All', value: 'all' },
]

export const AI_SUPPORT_ROLE_OPTIONS = [
  { label: 'Driver', value: 'driver' },
  { label: 'Passenger', value: 'passenger' },
]

export const AI_SUPPORT_STATUS_OPTIONS = [
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
]

export function getAiSupportActionItems(_record: AiSupportItem): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit', icon: Pencil, group: 0 },
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 1 },
  ]
}

export function getAiSupportStatusColor(status?: string) {
  const value = (status ?? '').toLowerCase()
  if (value === 'published') return 'success'
  if (value === 'draft') return 'processing'
  if (value === 'archived') return 'default'
  return 'default'
}

export function getAiSupportStatusLabel(status?: string) {
  const value = (status ?? '').toLowerCase()
  if (value === 'published') return 'Published'
  if (value === 'draft') return 'Draft'
  if (value === 'archived') return 'Archived'
  return status || '—'
}

export function getAiSupportCategoryLabel(category?: string) {
  if (!category) return '—'
  return titleCase(category)
}
