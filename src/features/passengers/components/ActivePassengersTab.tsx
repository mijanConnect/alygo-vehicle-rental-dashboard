import { useMemo, useState } from 'react'
import { Table } from 'antd'
import { Link } from 'react-router-dom'
import {
  createActionsColumn,
  createTableRowProps,
  getPassengerActionItems,
  handlePassengerAction,
  openPassengerDetails,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TableFilters } from '@/components/common/TableFilters'
import type { useAdminActions } from '@/hooks/useAdminActions'
import { useGetPassengersQuery } from '@/services/api'
import type { Passenger } from '@/types'

interface ActivePassengersTabProps {
  adminActions: ReturnType<typeof useAdminActions>
}

export function ActivePassengersTab({ adminActions }: ActivePassengersTabProps) {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useGetPassengersQuery({ page: 1, pageSize: 100, search })

  const activePassengers = useMemo(() => {
    const rows = data?.data.filter((p) => p.status === 'active') ?? []
    if (!search.trim()) return rows
    const q = search.trim().toLowerCase()
    return rows.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q),
    )
  }, [data?.data, search])

  return (
    <div className="space-y-4">
      <p className="text-sm text-alygo-text-muted">
        Real-time passenger activity monitor — online status, account health, and recent engagement.
      </p>
      <TableFilters
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search active passengers..."
      />
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={activePassengers}
        scroll={{ x: 900 }}
        {...createTableRowProps<Passenger>((record) => openPassengerDetails(record, adminActions))}
        columns={[
          {
            title: 'Passenger',
            dataIndex: 'name',
            render: (name: string, record: Passenger) => (
              <Link to={`/passengers/${record.id}`} onClick={(e) => e.stopPropagation()}>
                {name}
              </Link>
            ),
          },
          { title: 'ID', dataIndex: 'id' },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          { title: 'Trips', dataIndex: 'completedTrips' },
          { title: 'Rating', dataIndex: 'rating', render: (r: number) => `${r} ★` },
          { title: 'City', dataIndex: 'city' },
          createActionsColumn<Passenger>(
            () => getPassengerActionItems(),
            (key, record) => handlePassengerAction(key, record, adminActions),
          ),
        ]}
      />
    </div>
  )
}
