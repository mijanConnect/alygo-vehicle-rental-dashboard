import { useCallback, useMemo, useState } from 'react'
import { Select, Table, Tag, Tabs, type TableProps } from 'antd'
import { Link, useSearchParams } from 'react-router-dom'
import { AdminActionHost, createTableRowProps } from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { RIDE_CATEGORY_LABELS } from '@/constants'
import { ActiveDriversTab } from '@/features/drivers/components/ActiveDriversTab'
import { DriverDetailsDrawer } from '@/features/drivers/components/DriverDetailsDrawer'
import { DriverTableActions } from '@/features/drivers/components/DriverTableActions'
import { DriverVerificationOverviewCards } from '@/features/drivers/components/DriverVerificationOverviewCards'
import {
  DEFAULT_DRIVER_TAB,
  DRIVER_TAB_KEYS,
  DRIVER_TAB_LABELS,
  type DriverTabKey,
} from '@/features/drivers/driversNavigation'
import {
  mapComplianceDriver,
  mapOnlineDriver,
  mapOverviewDriver,
  mapPendingDriver,
  type DriverTableRow,
} from '@/features/drivers/mapDriverManagement'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useDriverApprovalMutation,
  useDriverRejectionMutation,
  useDriverSuspensionMutation,
  useDriverUnsuspensionMutation,
  useGetAllComplianceListQuery,
  useGetAllPendingApprovalsQuery,
  useGetAllSuspendedListQuery,
  useGetDriverManagementListQuery,
} from '@/redux/api/driverManagementApi'

export default function DriversPage() {
  useDocumentTitle('Driver Management')
  const adminActions = useAdminActions()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as DriverTabKey | null) ?? DEFAULT_DRIVER_TAB
  const validTab = DRIVER_TAB_KEYS.includes(activeTab) ? activeTab : DEFAULT_DRIVER_TAB

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null)

  const listParams = { page, limit, searchTerm }

  const overviewQuery = useGetDriverManagementListQuery(
    { ...listParams, status: status || undefined, tier: tierFilter || undefined },
    { skip: validTab !== 'overview' },
  )
  const pendingQuery = useGetAllPendingApprovalsQuery(listParams, {
    skip: validTab !== 'pending',
  })
  const suspendedQuery = useGetAllSuspendedListQuery(listParams, {
    skip: validTab !== 'suspended',
  })
  const complianceQuery = useGetAllComplianceListQuery(listParams, {
    skip: validTab !== 'compliance',
  })

  const [approveDriver] = useDriverApprovalMutation()
  const [rejectDriver] = useDriverRejectionMutation()
  const [suspendDriver] = useDriverSuspensionMutation()
  const [unsuspendDriver] = useDriverUnsuspensionMutation()

  const { rows, isLoading, isFetching, totalItems, totalPages } = useMemo(() => {
    if (validTab === 'pending') {
      const data = pendingQuery.data
      return {
        rows: (data?.data ?? []).map(mapPendingDriver),
        isLoading: pendingQuery.isLoading,
        isFetching: pendingQuery.isFetching,
        totalItems: data?.meta.totalItems ?? 0,
        totalPages: data?.meta.totalPages ?? 1,
      }
    }
    if (validTab === 'suspended') {
      const data = suspendedQuery.data
      return {
        rows: (data?.data ?? []).map(mapOnlineDriver),
        isLoading: suspendedQuery.isLoading,
        isFetching: suspendedQuery.isFetching,
        totalItems: data?.meta.totalItems ?? 0,
        totalPages: data?.meta.totalPages ?? 1,
      }
    }
    if (validTab === 'compliance') {
      const data = complianceQuery.data
      return {
        rows: (data?.data ?? []).map(mapComplianceDriver),
        isLoading: complianceQuery.isLoading,
        isFetching: complianceQuery.isFetching,
        totalItems: data?.meta.totalItems ?? 0,
        totalPages: data?.meta.totalPages ?? 1,
      }
    }

    const data = overviewQuery.data
    return {
      rows: (data?.data ?? []).map(mapOverviewDriver),
      isLoading: overviewQuery.isLoading,
      isFetching: overviewQuery.isFetching,
      totalItems: data?.meta.totalItems ?? 0,
      totalPages: data?.meta.totalPages ?? 1,
    }
  }, [
    validTab,
    overviewQuery.data,
    overviewQuery.isLoading,
    overviewQuery.isFetching,
    pendingQuery.data,
    pendingQuery.isLoading,
    pendingQuery.isFetching,
    suspendedQuery.data,
    suspendedQuery.isLoading,
    suspendedQuery.isFetching,
    complianceQuery.data,
    complianceQuery.isLoading,
    complianceQuery.isFetching,
  ])

  const handleApprove = (driver: DriverTableRow) => {
    adminActions.openConfirm({
      title: 'Approve Driver',
      description: `Approve driver application for ${driver.name}?`,
      confirmLabel: 'Approve',
      onConfirm: async () => {
        try {
          await approveDriver(driver.id).unwrap()
          adminActions.notify('Driver approved', driver.name)
        } catch {
          adminActions.notify('Unable to approve driver', driver.name)
        }
      },
    })
  }

  const handleReject = (driver: DriverTableRow) => {
    adminActions.openConfirm({
      title: 'Reject Driver',
      description: `Reject driver application for ${driver.name}?`,
      confirmLabel: 'Reject',
      danger: true,
      onConfirm: async () => {
        try {
          await rejectDriver(driver.id).unwrap()
          adminActions.notify('Driver rejected', driver.name)
        } catch {
          adminActions.notify('Unable to reject driver', driver.name)
        }
      },
    })
  }

  const handleSuspend = (driver: DriverTableRow) => {
    adminActions.openConfirm({
      title: 'Suspend Driver',
      description: `Suspend ${driver.name}?`,
      confirmLabel: 'Suspend',
      danger: true,
      onConfirm: async () => {
        try {
          await suspendDriver(driver.id).unwrap()
          adminActions.notify('Driver suspended', driver.name)
        } catch {
          adminActions.notify('Unable to suspend driver', driver.name)
        }
      },
    })
  }

  const handleUnsuspend = (driver: DriverTableRow) => {
    adminActions.openConfirm({
      title: 'Unsuspend Driver',
      description: `Restore access for ${driver.name}?`,
      confirmLabel: 'Unsuspend',
      onConfirm: async () => {
        try {
          await unsuspendDriver(driver.id).unwrap()
          adminActions.notify('Driver unsuspended', driver.name)
        } catch {
          adminActions.notify('Unable to unsuspend driver', driver.name)
        }
      },
    })
  }

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    setPage(1)
  }, [])

  const openDetails = (driver: DriverTableRow) => {
    setSelectedDriverId(driver.id)
  }

  const columns: TableProps<DriverTableRow>['columns'] = [
    {
      title: 'Driver Name',
      dataIndex: 'name',
      render: (name, record) => (
        <Link to={`/drivers/${record.id}`} onClick={(e) => e.stopPropagation()}>
          {name}
        </Link>
      ),
    },
    {
      title: 'Driver ID',
      dataIndex: 'id',
      width: 120,
      render: (id: string) => (
        <span className="font-mono text-xs text-white">{id.slice(-8)}</span>
      ),
    },
    { title: 'Rating', dataIndex: 'rating', render: (r: number) => `${r} ★` },
    { title: 'Completed Trips', dataIndex: 'completedTrips' },
    {
      title: 'Tier',
      dataIndex: 'currentTier',
      render: (tier?: string) => (tier ? <Tag>{tier}</Tag> : '—'),
    },
    {
      title: 'Tier Progress',
      render: (_: unknown, record: DriverTableRow) =>
        record.tierProgressText ??
        (record.tierProgress != null ? `${record.tierProgress}%` : '—'),
    },
    {
      title: 'Tier Status',
      dataIndex: 'tierStatus',
      render: (tierStatus?: DriverTableRow['tierStatus']) =>
        tierStatus ? (
          <StatusBadge status={tierStatus === 'good_standing' ? 'active' : 'at_risk'} />
        ) : (
          '—'
        ),
    },
    { title: 'Vehicle', dataIndex: 'vehicle', ellipsis: true },
    {
      title: 'Ride Categories',
      dataIndex: 'categories',
      render: (cats: DriverTableRow['categories']) =>
        cats?.length
          ? cats.map((c) => <Tag key={c}>{RIDE_CATEGORY_LABELS[c] ?? c}</Tag>)
          : '—',
    },
    {
      title: 'Background Check',
      dataIndex: 'backgroundCheckStatus',
      render: (s: string) => <StatusBadge status={s} />,
    },
    { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: validTab === 'pending' ? 300 : validTab === 'suspended' ? 180 : 100,
      render: (_: unknown, record: DriverTableRow) => (
        <DriverTableActions
          record={record}
          tab={validTab}
          onDetails={openDetails}
          onApprove={handleApprove}
          onReject={handleReject}
          onSuspend={handleSuspend}
          onUnsuspend={handleUnsuspend}
        />
      ),
    },
  ]

  const segmentTable = (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchingInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search drivers..."
          className="flex-1"
        />
        {validTab === 'overview' && (
          <>
            <Select
              allowClear
              placeholder="Status"
              className="w-full lg:w-40"
              value={status || undefined}
              onChange={(value) => {
                setStatus(value ?? '')
                setPage(1)
              }}
              options={[
                { label: 'Active', value: 'approved' },
                { label: 'Pending', value: 'pending' },
                { label: 'Suspended', value: 'suspended' },
              ]}
            />
            <Select
              allowClear
              placeholder="Filter by tier"
              className="w-full lg:w-44"
              value={tierFilter || undefined}
              onChange={(value) => {
                setTierFilter(value ?? '')
                setPage(1)
              }}
              options={[
                { label: 'Platinum', value: 'Platinum' },
                { label: 'Diamond', value: 'Diamond' },
                { label: 'Elite', value: 'Elite' },
              ]}
            />
          </>
        )}
      </div>

      <Table
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={rows}
        rowKey="id"
        scroll={{ x: 1500 }}
        pagination={false}
        {...createTableRowProps<DriverTableRow>(openDetails)}
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
      title="Driver Management"
      description="Manage driver onboarding, compliance, identity verification, and lifecycle."
    >
      {validTab === 'overview' && <DriverVerificationOverviewCards />}

      <div className={`glass-card p-4 ${validTab === 'overview' ? 'mt-6' : ''}`}>
        <Tabs
          activeKey={validTab}
          onChange={(key) => {
            setPage(1)
            setSearchTerm('')
            setStatus('')
            setTierFilter('')
            setSearchParams({ tab: key })
          }}
          items={[
            {
              key: 'overview',
              label: DRIVER_TAB_LABELS.overview,
              children: segmentTable,
            },
            {
              key: 'active',
              label: DRIVER_TAB_LABELS.active,
              children: (
                <ActiveDriversTab onOpenDetails={(id) => setSelectedDriverId(id)} />
              ),
            },
            {
              key: 'pending',
              label: DRIVER_TAB_LABELS.pending,
              children: segmentTable,
            },
            {
              key: 'suspended',
              label: DRIVER_TAB_LABELS.suspended,
              children: segmentTable,
            },
            {
              key: 'compliance',
              label: DRIVER_TAB_LABELS.compliance,
              children: segmentTable,
            },
          ]}
        />
      </div>

      <DriverDetailsDrawer
        open={Boolean(selectedDriverId)}
        driverId={selectedDriverId}
        onClose={() => setSelectedDriverId(null)}
      />
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
