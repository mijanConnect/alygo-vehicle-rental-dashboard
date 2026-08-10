import { useCallback, useMemo, useState } from 'react'
import { Select, Table, Tag, Tabs, type TableProps } from 'antd'
import { Link, useSearchParams } from 'react-router-dom'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
  getDriverManagementActionItems,
  handleDriverAction,
  type DriverActionHandlers,
} from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { RIDE_CATEGORY_LABELS } from '@/constants'
import { ActiveDriversTab } from '@/features/drivers/components/ActiveDriversTab'
import { DriverVerificationDrawer } from '@/features/drivers/components/DriverVerificationDrawer'
import { DriverVerificationOverviewCards } from '@/features/drivers/components/DriverVerificationOverviewCards'
import { IdentityVerificationBadge } from '@/features/drivers/components/IdentityVerificationBadge'
import { IdentityVerificationSettings } from '@/features/drivers/components/IdentityVerificationSettings'
import type { DriverVerificationFocus } from '@/features/drivers/driverVerificationHelpers'
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
import { baseApi } from '@/redux/baseApi'
import {
  useGetAllComplianceListQuery,
  useGetAllPendingApprovalsQuery,
  useGetAllSuspendedListQuery,
  useGetDriverManagementListQuery,
} from '@/redux/api/driverManagementApi'
import {
  useApproveVerificationMutation,
  useRejectVerificationMutation,
} from '@/services/driverVerificationApi'
import type { IdentityVerificationStatus } from '@/types/driverVerification'
import { useAppDispatch } from '@/store/hooks'

export default function DriversPage() {
  useDocumentTitle('Driver Management')
  const dispatch = useAppDispatch()
  const adminActions = useAdminActions()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as DriverTabKey | null) ?? DEFAULT_DRIVER_TAB
  const validTab = DRIVER_TAB_KEYS.includes(activeTab) ? activeTab : DEFAULT_DRIVER_TAB

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [drawerDriver, setDrawerDriver] = useState<DriverTableRow | null>(null)
  const [drawerFocus, setDrawerFocus] = useState<DriverVerificationFocus>('default')

  const listParams = { page, limit, searchTerm }

  const overviewQuery = useGetDriverManagementListQuery(
    { ...listParams, status: status || undefined, tier: tierFilter || undefined },
    { skip: validTab !== 'overview' && validTab !== 'reverification' },
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

  const [approveVerification] = useApproveVerificationMutation()
  const [rejectVerification] = useRejectVerificationMutation()

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
    let mapped = (data?.data ?? []).map(mapOverviewDriver)
    if (validTab === 'reverification') {
      mapped = mapped.filter((d) => d.identityVerificationStatus !== 'verified')
    }
    return {
      rows: mapped,
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

  const openDrawer = (driver: DriverTableRow, focus: DriverVerificationFocus = 'default') => {
    setDrawerDriver(driver)
    setDrawerFocus(focus)
  }

  const invalidateDrivers = () => {
    dispatch(baseApi.util.invalidateTags(['Drivers']))
  }

  const verificationHandlers: DriverActionHandlers = {
    onOpenVerificationDrawer: openDrawer,
    onApproveVerification: (driver) => {
      adminActions.openConfirm({
        title: 'Approve Verification',
        description: `Approve identity verification for ${driver.name}?`,
        confirmLabel: 'Approve',
        onConfirm: async () => {
          await approveVerification(driver.id).unwrap()
          adminActions.notify('Verification approved', driver.name)
          invalidateDrivers()
          openDrawer(driver as DriverTableRow, 'default')
        },
      })
    },
    onRejectVerification: (driver) => {
      adminActions.openConfirm({
        title: 'Reject Verification',
        description: `Reject identity verification for ${driver.name}?`,
        confirmLabel: 'Reject',
        danger: true,
        onConfirm: async () => {
          await rejectVerification({ driverId: driver.id }).unwrap()
          adminActions.notify('Verification rejected', driver.name)
          invalidateDrivers()
          openDrawer(driver as DriverTableRow, 'default')
        },
      })
    },
  }

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    setPage(1)
  }, [])

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
      title: 'Compliance',
      dataIndex: 'complianceStatus',
      render: (s: string) => <StatusBadge status={s} />,
    },
    {
      title: 'Background Check',
      dataIndex: 'backgroundCheckStatus',
      render: (s: string) => <StatusBadge status={s} />,
    },
    {
      title: 'Identity Verification',
      dataIndex: 'identityVerificationStatus',
      render: (s: IdentityVerificationStatus) => <IdentityVerificationBadge status={s} />,
    },
    { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
    createActionsColumn<DriverTableRow>(
      () => getDriverManagementActionItems(),
      (key, record) => handleDriverAction(key, record, adminActions, verificationHandlers),
    ),
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
        {...createTableRowProps<DriverTableRow>((record) => openDrawer(record))}
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
              children: <ActiveDriversTab adminActions={adminActions} />,
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
            {
              key: 'reverification',
              label: DRIVER_TAB_LABELS.reverification,
              children: (
                <div className="space-y-6">
                  {segmentTable}
                  <div className="border-t border-white/5 pt-6">
                    <h3 className="mb-4 font-semibold text-white">Identity Verification Rules</h3>
                    <IdentityVerificationSettings />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>

      <DriverVerificationDrawer
        open={!!drawerDriver}
        driver={drawerDriver}
        focus={drawerFocus}
        onClose={() => setDrawerDriver(null)}
      />
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
