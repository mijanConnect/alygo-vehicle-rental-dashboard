import { Select } from 'antd'
import { cn } from '@/utils/cn'

export interface FilteringOption {
  label: string
  value: string
}

export interface FilteringField {
  key: string
  placeholder?: string
  options: FilteringOption[]
  value?: string
  onChange: (value: string) => void
  allowClear?: boolean
  className?: string
  /** Minimum width in px. Defaults to 180. */
  minWidth?: number
}

interface FilteringProps {
  fields: FilteringField[]
  className?: string
  /** `standalone` wraps in a glass card. `inline` is just the row. */
  variant?: 'standalone' | 'inline'
}

const selectClassName =
  '[&_.ant-select-selector]:!h-[45px] [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-white/10 [&_.ant-select-selector]:!bg-white/5 [&_.ant-select-selection-item]:!leading-[43px] [&_.ant-select-selection-placeholder]:!leading-[43px]'

export function Filtering({
  fields,
  className,
  variant = 'standalone',
}: FilteringProps) {
  if (!fields.length) return null

  const content = (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center',
        variant === 'inline' && className,
      )}
    >
      {fields.map((field) => (
        <Select
          key={field.key}
          allowClear={field.allowClear ?? true}
          placeholder={field.placeholder ?? 'Filter'}
          value={field.value || undefined}
          onChange={(next) => field.onChange(next ?? '')}
          options={field.options}
          className={cn(selectClassName, field.className)}
          style={{ minWidth: field.minWidth ?? 180 }}
          popupMatchSelectWidth={false}
        />
      ))}
    </div>
  )

  if (variant === 'inline') {
    return content
  }

  return (
    <div
      className={cn(
        'glass-card mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center',
        className,
      )}
    >
      {content}
    </div>
  )
}
