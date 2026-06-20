import { Input, Select } from 'antd'
import { Search } from 'lucide-react'

interface TableFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  statusOptions?: { label: string; value: string }[]
  status?: string
  onStatusChange?: (value: string) => void
  variant?: 'standalone' | 'inline'
}

export function TableFilters({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  statusOptions,
  status,
  onStatusChange,
  variant = 'standalone',
}: TableFiltersProps) {
  const content = (
    <>
      <Input
        prefix={<Search className="h-4 w-4 text-alygo-text-muted" />}
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="!max-w-md !rounded-xl !border-white/10 !bg-white/5"
      />
      {statusOptions && onStatusChange && (
        <Select
          placeholder="Filter by status"
          value={status || undefined}
          onChange={onStatusChange}
          allowClear
          options={statusOptions}
          className="!min-w-[180px]"
        />
      )}
    </>
  )

  if (variant === 'inline') {
    return <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{content}</div>
  }

  return (
    <div className="glass-card mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      {content}
    </div>
  )
}
