import { DatePicker, Input, Select } from 'antd'
import type { Dayjs } from 'dayjs'
import { Search } from 'lucide-react'
import {
  RESERVATION_STATUS_OPTIONS,
  RESERVATION_TYPE_OPTIONS,
  type ReservationFilters,
} from '@/features/reservations/reservationData'

interface ReservationFilterBarProps {
  filters: ReservationFilters
  onChange: (patch: Partial<ReservationFilters>) => void
  dateRange: [Dayjs | null, Dayjs | null] | null
  onDateRangeChange: (from?: string, to?: string, range?: [Dayjs | null, Dayjs | null] | null) => void
}

export function ReservationFilterBar({
  filters,
  onChange,
  onDateRangeChange,
  dateRange,
}: ReservationFilterBarProps) {
  return (
    <div className="glass-card mb-4 p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Select
          placeholder="Reservation Type"
          value={filters.type || undefined}
          onChange={(value) => onChange({ type: value ?? '' })}
          allowClear
          options={RESERVATION_TYPE_OPTIONS.filter((o) => o.value !== '').map((o) => ({
            label: o.label,
            value: o.value,
          }))}
          className="w-full"
        />
        <Select
          placeholder="Status"
          value={filters.status || undefined}
          onChange={(value) => onChange({ status: value ?? '' })}
          allowClear
          options={[...RESERVATION_STATUS_OPTIONS]}
          className="w-full"
        />
        <DatePicker.RangePicker
          value={dateRange}
          onChange={(dates) => {
            onDateRangeChange(
              dates?.[0]?.startOf('day').toISOString(),
              dates?.[1]?.endOf('day').toISOString(),
              dates,
            )
          }}
          className="w-full"
        />
        <Input
          prefix={<Search className="h-4 w-4 text-alygo-text-muted" />}
          placeholder="Search reservations..."
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
        <Input
          placeholder="Filter by driver"
          value={filters.driver}
          onChange={(e) => onChange({ driver: e.target.value })}
        />
        <Input
          placeholder="Filter by passenger"
          value={filters.passenger}
          onChange={(e) => onChange({ passenger: e.target.value })}
        />
        <Input
          placeholder="Filter by airport"
          value={filters.airport}
          onChange={(e) => onChange({ airport: e.target.value })}
        />
        <Input
          placeholder="Filter by city"
          value={filters.city}
          onChange={(e) => onChange({ city: e.target.value })}
        />
      </div>
    </div>
  )
}
