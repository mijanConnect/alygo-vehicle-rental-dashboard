import { useMemo, useState } from 'react'
import { Table, Tag } from 'antd'
import { Link } from 'react-router-dom'
import {
  createActionsColumn,
  createTableRowProps,
  getActiveDriverActionItems,
  handleDriverAction,
  openDriverDetails,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TableFilters } from '@/components/common/TableFilters'
import { RIDE_CATEGORY_LABELS } from '@/constants'
import type { useAdminActions } from '@/hooks/useAdminActions'
import { LEVEL_LABELS } from '@/services/driverRewardsApi'
import { useGetDriversQuery } from '@/services/api'
import type { Driver, RideCategory } from '@/types'

interface ActiveDriversTabProps {
  adminActions: ReturnType<typeof useAdminActions>
}

export function ActiveDriversTab({ adminActions }: ActiveDriversTabProps) {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useGetDriversQuery({ page: 1, pageSize: 100, search })

  const onlineDrivers = useMemo(() => {
    const rows = data?.data.filter((d) => d.status === 'active') ?? []
    if (!search.trim()) return rows
    const q = search.trim().toLowerCase()
    return rows.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.vehicle.toLowerCase().includes(q),
    )
  }, [data?.data, search])

  return (
    <div className="space-y-4">
      <p className="text-sm text-alygo-text-muted">
        Real-time online drivers monitor — availability, tier, vehicle category, and operational status.
      </p>
      <TableFilters
        variant="inline"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search online drivers..."
      />
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={onlineDrivers}
        scroll={{ x: 1200 }}
        {...createTableRowProps<Driver>((record) => openDriverDetails(record, adminActions))}
        columns={[
          {
            title: 'Driver',
            dataIndex: 'name',
            render: (name: string, record: Driver) => (
              <Link to={`/drivers/${record.id}`} onClick={(e) => e.stopPropagation()}>
                {name}
              </Link>
            ),
          },
          {
            title: 'Online Status',
            dataIndex: 'status',
            render: () => <StatusBadge status="active" />,
          },
          { title: 'City', dataIndex: 'city' },
          {
            title: 'Vehicle Category',
            dataIndex: 'categories',
            render: (categories: RideCategory[]) =>
              categories?.slice(0, 2).map((c) => (
                <Tag key={c} className="!mr-1">{RIDE_CATEGORY_LABELS[c]}</Tag>
              )) ?? '—',
          },
          {
            title: 'Tier',
            dataIndex: 'currentTier',
            render: (tier?: string) =>
              tier ? LEVEL_LABELS[tier] ?? tier : '—',
          },
          { title: 'Vehicle', dataIndex: 'vehicle', ellipsis: true },
          { title: 'Rating', dataIndex: 'rating', render: (r: number) => `${r} ★` },
          {
            title: 'Availability',
            render: () => <Tag color="green">Available</Tag>,
          },
          createActionsColumn<Driver>(
            () => getActiveDriverActionItems(),
            (key, record) => handleDriverAction(key, record, adminActions),
          ),
        ]}
      />
    </div>
  )
}
