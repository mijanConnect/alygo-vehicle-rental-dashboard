import { useCallback, useMemo, useState } from 'react'
import { Table, Tabs, type TableProps } from 'antd'
import { Link, useSearchParams } from 'react-router-dom'
import { AdminActionHost, createTableRowProps } from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { ActivePassengersTab } from '@/features/passengers/components/ActivePassengersTab'
import { PassengerDetailsDrawer } from '@/features/passengers/components/PassengerDetailsDrawer'
import { PassengerTableActions } from '@/features/passengers/components/PassengerTableActions'
import {
  PassengerComplaintsTab,
  PassengerRefundsTab,
} from '@/features/passengers/components/PassengerCaseTabs'
import { mapPassengerListItem } from '@/features/passengers/mapPassengerManagement'
import {
  DEFAULT_PASSENGER_TAB,
  PASSENGER_TAB_KEYS,
  PASSENGER_TAB_LABELS,
  type PassengerTabKey,
} from '@/features/passengers/passengersNavigation'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useGetAllSuspendedPassengersQuery,
  useGetPassengersListQuery,
  useSuspendPassengerMutation,
  useUnsuspendPassengerMutation,
} from '@/redux/api/passengersApi'
import type { Passenger } from '@/types'
import { formatCurrency } from '@/utils/format'

export default function PassengersPage() {
  useDocumentTitle('Passenger Management')
  const adminActions = useAdminActions()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab =
    (searchParams.get('tab') as PassengerTabKey | null) ?? DEFAULT_PASSENGER_TAB
  const validTab = PASSENGER_TAB_KEYS.includes(activeTab)
    ? activeTab
    : DEFAULT_PASSENGER_TAB

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPassengerId, setSelectedPassengerId] = useState<string | null>(null)

  const listParams = { page, limit, searchTerm }

  const overviewQuery = useGetPassengersListQuery(listParams, {
    skip: validTab !== 'overview',
  })
  const suspendedQuery = useGetAllSuspendedPassengersQuery(listParams, {
    skip: validTab !== 'suspended',
  })

  const [suspendPassenger] = useSuspendPassengerMutation()
  const [unsuspendPassenger] = useUnsuspendPassengerMutation()

  const { rows, isLoading, isFetching, totalItems, totalPages } = useMemo(() => {
    const query = validTab === 'suspended' ? suspendedQuery : overviewQuery
    const data = query.data
    return {
      rows: (data?.data ?? []).map(mapPassengerListItem),
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      totalItems: data?.meta.totalItems ?? 0,
      totalPages: data?.meta.totalPages ?? 1,
    }
  }, [validTab, overviewQuery, suspendedQuery])

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    setPage(1)
  }, [])

  const openDetails = (passenger: Passenger) => {
    setSelectedPassengerId(passenger.id)
  }

  const handleSuspend = (passenger: Passenger) => {
    adminActions.openConfirm({
      title: 'Suspend Passenger',
      description: `Suspend ${passenger.name}?`,
      confirmLabel: 'Suspend',
      danger: true,
      onConfirm: async () => {
        try {
          await suspendPassenger(passenger.id).unwrap()
          adminActions.notify('Passenger suspended', passenger.name)
        } catch {
          adminActions.notify('Unable to suspend passenger', passenger.name)
        }
      },
    })
  }

  const handleUnsuspend = (passenger: Passenger) => {
    adminActions.openConfirm({
      title: 'Unsuspend Passenger',
      description: `Restore access for ${passenger.name}?`,
      confirmLabel: 'Unsuspend',
      onConfirm: async () => {
        try {
          await unsuspendPassenger(passenger.id).unwrap()
          adminActions.notify('Passenger unsuspended', passenger.name)
        } catch {
          adminActions.notify('Unable to unsuspend passenger', passenger.name)
        }
      },
    })
  }

  const actionMode = validTab === 'suspended' ? 'suspended' : 'default'

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
    {
      title: 'Passenger ID',
      dataIndex: 'id',
      width: 120,
      render: (id: string) => (
        <span className="font-mono text-xs text-white">{id.slice(-8)}</span>
      ),
    },
    { title: 'Email', dataIndex: 'email', ellipsis: true },
    { title: 'Rating', dataIndex: 'rating', width: 90, render: (r: number) => `${r} ★` },
    { title: 'Trips', dataIndex: 'completedTrips', width: 80 },
    {
      title: 'Wallet',
      dataIndex: 'walletBalance',
      width: 110,
      render: (v: number) => formatCurrency(v),
    },
    { title: 'City', dataIndex: 'city', ellipsis: true },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (s: string) => <StatusBadge status={s} />,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_: unknown, record: Passenger) => (
        <PassengerTableActions
          record={record}
          mode={actionMode}
          onDetails={openDetails}
          onSuspend={handleSuspend}
          onUnsuspend={handleUnsuspend}
        />
      ),
    },
  ]

  const passengerTable = (
    <>
      <div className="mb-4">
        <SearchingInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search passengers..."
        />
      </div>
      <Table
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={rows}
        rowKey="id"
        scroll={{ x: 1000 }}
        pagination={false}
        {...createTableRowProps<Passenger>(openDetails)}
      />
      <Pagination
        currentPage={page}
        totalPages={Math.max(totalPages, 1)}
        totalItems={totalItems}
        itemsPerPage={limit}
        onPageChange={setPage}
        onItemsPerPageChange={(next) => {
          setLimit(next)
          setPage(1)
        }}
      />
    </>
  )

  return (
    <PageShell
      title="Passenger Management"
      description="Manage passenger accounts, wallets, and support actions."
    >
      <div className="glass-card mt-6 p-4">
        <Tabs
          activeKey={validTab}
          onChange={(key) => {
            setPage(1)
            setSearchTerm('')
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
              children: (
                <ActivePassengersTab
                  onOpenDetails={(id) => setSelectedPassengerId(id)}
                  onSuspend={handleSuspend}
                />
              ),
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

      <PassengerDetailsDrawer
        open={Boolean(selectedPassengerId)}
        passengerId={selectedPassengerId}
        onClose={() => setSelectedPassengerId(null)}
      />
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
