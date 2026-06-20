import { Tag } from 'antd'
import type { RuleInheritanceSource } from '@/types/drivingHours'
import { INHERITANCE_LABELS, inheritanceBadgeColor } from '@/features/driving-hours/drivingHoursHelpers'

interface RuleInheritanceBadgeProps {
  source: RuleInheritanceSource
  variant?: 'state' | 'city'
}

export function RuleInheritanceBadge({ source, variant = 'city' }: RuleInheritanceBadgeProps) {
  const label = variant === 'state' && source === 'custom'
    ? 'Overrides Global'
    : INHERITANCE_LABELS[source]

  return (
    <Tag color={inheritanceBadgeColor(source === 'custom' && variant === 'state' ? 'custom' : source)}>
      {label}
    </Tag>
  )
}
