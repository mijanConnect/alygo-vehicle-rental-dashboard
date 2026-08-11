import { useState } from 'react'
import { Select, Table, Tag } from 'antd'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { useGetDriverDutyHourMonitoringQuery } from '@/redux/api/drivingHoursApi'
import type { DriverDutyHourMonitoringItem } from '@/redux/api/drivingHoursApi'

const STATUS_OPTIONS = [
  { label: 'Online', value: 'online' },
  { label: 'Offline', value: 'offline' },
]

const statusColors: Record<string, string> = {
  online: 'success',
  offline: 'default',
  near_limit: 'warning',
  over_limit: 'error',
  on_reset: 'processing',
}

function formatHours(value: number | undefined) {
  return `${value ?? 0}h`
}

export function DriverHoursMonitoringTable() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('')

  const { data, isLoading, isFetching } = useGetDriverDutyHourMonitoringQuery({
    page,
    limit,
    searchTerm,
    status: status || undefined,
  })

  const rows = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchingInput
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value)
            setPage(1)
          }}
          placeholder="Search drivers..."
        />
        <Select
          allowClear
          placeholder="Filter by status"
          className="!min-w-[160px]"
          value={status || undefined}
          options={STATUS_OPTIONS}
          onChange={(value) => {
            setStatus(value ?? '')
            setPage(1)
          }}
        />
      </div>

      <Table
        loading={isLoading || isFetching}
        rowKey="driverId"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 1300 }}
        columns={[
          {
            title: 'Driver',
            dataIndex: 'name',
            render: (name: string, record: DriverDutyHourMonitoringItem) =>
              name?.trim() || record.email?.trim() || record.driverId.slice(-8),
          },
          {
            title: 'Driver ID',
            dataIndex: 'driverId',
            width: 120,
            render: (id: string) => (
              <span className="font-mono text-xs text-white">{id.slice(-8)}</span>
            ),
          },
          {
            title: 'Phone',
            dataIndex: 'phone',
            render: (phone: string) => phone?.trim() || '—',
          },
          {
            title: 'City',
            dataIndex: 'city',
            render: (city: string) => city?.trim() || '—',
          },
          {
            title: 'State',
            dataIndex: 'state',
            render: (state: string) => state?.trim() || '—',
          },
          {
            title: 'Hours Today',
            dataIndex: 'drivingHoursToday',
            render: (h: number) => formatHours(h),
          },
          {
            title: 'Remaining Today',
            dataIndex: 'remainingHoursToday',
            render: (h: number) => formatHours(h),
          },
          {
            title: 'Continuous',
            dataIndex: 'continuousDrivingHours',
            render: (h: number) => formatHours(h),
          },
          {
            title: 'Daily Limit',
            dataIndex: 'dailyLimit',
            render: (h: number) => formatHours(h),
          },
          {
            title: 'Max Continuous',
            dataIndex: 'maxHours',
            render: (h: number) => formatHours(h),
          },
          {
            title: 'Reset Hours',
            dataIndex: 'resetHours',
            render: (h: number) => formatHours(h),
          },
          {
            title: 'Break',
            dataIndex: 'breakMinutes',
            render: (m: number) => `${m ?? 0}m`,
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) =>
              statusColors[s] ? (
                <Tag color={statusColors[s]}>{s}</Tag>
              ) : (
                <StatusBadge status={s} />
              ),
          },
        ]}
      />

      <Pagination
        currentPage={meta?.page ?? page}
        totalPages={Math.max(meta?.totalPages ?? 1, 1)}
        totalItems={meta?.totalItems ?? 0}
        itemsPerPage={meta?.limit ?? limit}
        onPageChange={setPage}
        onItemsPerPageChange={(size) => {
          setLimit(size)
          setPage(1)
        }}
      />
    </div>
  )
}
