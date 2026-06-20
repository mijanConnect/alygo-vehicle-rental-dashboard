import { Table, Tabs, type TableProps } from 'antd'
import { Link, useSearchParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
  getPassengerActionItems,
  handlePassengerAction,
  openPassengerDetails,
} from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TableFilters } from '@/components/common/TableFilters'
import { ActivePassengersTab } from '@/features/passengers/components/ActivePassengersTab'
import { PassengerComplaintsTab, PassengerRefundsTab } from '@/features/passengers/components/PassengerCaseTabs'
import {
  DEFAULT_PASSENGER_TAB,
  PASSENGER_TAB_KEYS,
  PASSENGER_TAB_LABELS,
  type PassengerTabKey,
} from '@/features/passengers/passengersNavigation'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useGetPassengersQuery } from '@/services/api'
import type { Passenger } from '@/types'
import { formatCurrency } from '@/utils/format'

export default function PassengersPage() {
  useDocumentTitle('Passenger Management')
  const adminActions = useAdminActions()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as PassengerTabKey | null) ?? DEFAULT_PASSENGER_TAB
  const validTab = PASSENGER_TAB_KEYS.includes(activeTab) ? activeTab : DEFAULT_PASSENGER_TAB

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading } = useGetPassengersQuery({ page, pageSize: 10, search })

  const filtered = useMemo(() => {
    let rows = data?.data ?? []
    if (validTab === 'suspended') {
      rows = rows.filter((p) => p.status === 'suspended' || p.status === 'banned')
    }
    return rows
  }, [data?.data, validTab])

  const columns: TableProps<Passenger>['columns'] = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (name, record) => (
        <Link to={`/passengers/${record.id}`} onClick={(e) => e.stopPropagation()}>
          {name}
        </Link>
      ),
    },
    { title: 'Passenger ID', dataIndex: 'id' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Rating', dataIndex: 'rating', render: (r: number) => `${r} ★` },
    { title: 'Trips', dataIndex: 'completedTrips' },
    { title: 'Wallet', dataIndex: 'walletBalance', render: (v: number) => formatCurrency(v) },
    { title: 'City', dataIndex: 'city' },
    { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
    createActionsColumn(
      () => getPassengerActionItems(),
      (key, record) => handlePassengerAction(key, record, adminActions),
    ),
  ]

  const passengerTable = (
    <Table
      loading={isLoading}
      columns={columns}
      dataSource={filtered}
      rowKey="id"
      scroll={{ x: 1100 }}
      {...createTableRowProps<Passenger>((record) => openPassengerDetails(record, adminActions))}
      pagination={{ current: page, total: data?.total, pageSize: 10, onChange: setPage }}
    />
  )

  return (
    <PageShell title="Passenger Management" description="Manage passenger accounts, wallets, and support actions.">
      {validTab === 'overview' && (
        <TableFilters
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search passengers..."
        />
      )}

      <div className={`glass-card p-4 ${validTab === 'overview' ? 'mt-4' : 'mt-6'}`}>
        <Tabs
          activeKey={validTab}
          onChange={(key) => {
            setPage(1)
            setSearchParams({ tab: key })
          }}
          items={[
            {
              key: 'overview',
              label: PASSENGER_TAB_LABELS.overview,
              children: passengerTable,
            },
            {
              key: 'active',
              label: PASSENGER_TAB_LABELS.active,
              children: <ActivePassengersTab adminActions={adminActions} />,
            },
            {
              key: 'complaints',
              label: PASSENGER_TAB_LABELS.complaints,
              children: <PassengerComplaintsTab />,
            },
            {
              key: 'refunds',
              label: PASSENGER_TAB_LABELS.refunds,
              children: <PassengerRefundsTab />,
            },
            {
              key: 'suspended',
              label: PASSENGER_TAB_LABELS.suspended,
              children: passengerTable,
            },
          ]}
        />
      </div>
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
