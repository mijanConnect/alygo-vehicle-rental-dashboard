import type { LucideIcon } from 'lucide-react'

import type { ReactNode } from 'react'

export interface ActionMenuItem {
  key: string
  label: string
  icon: LucideIcon
  group?: number
  danger?: boolean
  disabled?: boolean
}

export interface DetailField {
  label: string
  value: ReactNode
}

export interface ConfirmConfig {
  title: string
  description: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
}

export interface ApprovalConfig {
  title: string
  entityLabel: string
  onApprove: (notes?: string) => void
}

export interface SuspensionConfig {
  title: string
  entityLabel: string
  onConfirm: (reason?: string) => void
}
