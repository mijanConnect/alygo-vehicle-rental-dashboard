import { Table, Tag } from 'antd'
import { createTableRowProps } from '@/components/admin'
import { useGetDriverHoursRecordsQuery } from '@/services/drivingHoursApi'
import type { DriverHoursRecord } from '@/types/drivingHours'
import { DRIVER_HOURS_STATUS_LABELS } from '@/features/driving-hours/drivingHoursHelpers'

const statusColors: Record<string, string> = {
  active: 'success',
  near_limit: 'warning',
  over_limit: 'error',
  on_reset: 'processing',
}

export function DriverHoursMonitoringTable() {
  const { data = [], isLoading } = useGetDriverHoursRecordsQuery()

  return (
    <Table
      loading={isLoading}
      rowKey="id"
      dataSource={data}
      scroll={{ x: 1200 }}
      {...createTableRowProps<DriverHoursRecord>(() => {})}
      columns={[
        { title: 'Driver', dataIndex: 'driverName' },
        { title: 'Driver ID', dataIndex: 'driverId', width: 100 },
        { title: 'City', dataIndex: 'city' },
        { title: 'State', dataIndex: 'state' },
        { title: 'Hours Today', dataIndex: 'hoursDrivenToday', render: (h: number) => `${h}h` },
        { title: 'Hours This Week', dataIndex: 'hoursDrivenThisWeek', render: (h: number) => `${h}h` },
        { title: 'Max Allowed', dataIndex: 'maxAllowedHours', render: (h: number) => `${h}h` },
        { title: 'Reset Remaining', dataIndex: 'resetHoursRemaining', render: (h: number) => (h > 0 ? `${h}h` : '—') },
        { title: 'Violations', dataIndex: 'violations' },
        {
          title: 'Status',
          dataIndex: 'status',
          render: (s: string) => (
            <Tag color={statusColors[s]}>{DRIVER_HOURS_STATUS_LABELS[s] ?? s}</Tag>
          ),
        },
        {
          title: 'Last Trip',
          dataIndex: 'lastTripEndedAt',
          render: (d: string) => new Date(d).toLocaleString(),
        },
      ]}
    />
  )
}
