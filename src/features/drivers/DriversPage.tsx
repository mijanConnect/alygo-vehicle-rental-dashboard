import { Select, Table, Tag, Tabs, type TableProps } from 'antd'
import { Link, useSearchParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
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
import { TableFilters } from '@/components/common/TableFilters'
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
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { api, useGetDriversQuery } from '@/services/api'
import {
  useApproveVerificationMutation,
  useRejectVerificationMutation,
  IDENTITY_STATUS_LABELS,
} from '@/services/driverVerificationApi'
import { LEVEL_LABELS } from '@/services/driverRewardsApi'
import type { Driver } from '@/types'
import type { IdentityVerificationStatus } from '@/types/driverVerification'

function applyTabPreset(rows: Driver[], tab: DriverTabKey): Driver[] {
  switch (tab) {
    case 'pending':
      return rows.filter((d) => d.status === 'pending')
    case 'suspended':
      return rows.filter((d) => d.status === 'suspended' || d.status === 'deactivated')
    case 'compliance':
      return rows.filter(
        (d) => d.complianceStatus !== 'approved' || d.backgroundCheckStatus !== 'approved',
      )
    case 'reverification':
      return rows.filter((d) => d.identityVerificationStatus !== 'verified')
    default:
      return rows
  }
}

export default function DriversPage() {
  useDocumentTitle('Driver Management')
  const dispatch = useDispatch()
  const adminActions = useAdminActions()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as DriverTabKey | null) ?? DEFAULT_DRIVER_TAB
  const validTab = DRIVER_TAB_KEYS.includes(activeTab) ? activeTab : DEFAULT_DRIVER_TAB

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [identityStatus, setIdentityStatus] = useState('')
  const [drawerDriver, setDrawerDriver] = useState<Driver | null>(null)
  const [drawerFocus, setDrawerFocus] = useState<DriverVerificationFocus>('default')
  const { data, isLoading, refetch } = useGetDriversQuery({ page, pageSize: 10, search })
  const [approveVerification] = useApproveVerificationMutation()
  const [rejectVerification] = useRejectVerificationMutation()

  const filtered = useMemo(() => {
    let rows = data?.data ?? []
    rows = applyTabPreset(rows, validTab)
    if (validTab === 'overview') {
      if (status) rows = rows.filter((d) => d.status === status)
      if (tierFilter) rows = rows.filter((d) => d.currentTier === tierFilter)
      if (identityStatus) rows = rows.filter((d) => d.identityVerificationStatus === identityStatus)
    }
    return rows
  }, [data?.data, validTab, status, tierFilter, identityStatus])

  const openDrawer = (driver: Driver, focus: DriverVerificationFocus = 'default') => {
    setDrawerDriver(driver)
    setDrawerFocus(focus)
  }

  const invalidateDrivers = () => {
    dispatch(api.util.invalidateTags(['Drivers']))
    refetch()
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
          openDrawer(driver, 'default')
        },
      })
    },
    onRejectVerification: (driver) => {
      adminActions.openConfirm({
        title: 'Reject Verification',
        description: `Reject identity verification for ${driver.name}? The driver may be paused per policy settings.`,
        confirmLabel: 'Reject',
        danger: true,
        onConfirm: async () => {
          await rejectVerification({ driverId: driver.id }).unwrap()
          adminActions.notify('Verification rejected', driver.name)
          invalidateDrivers()
          openDrawer(driver, 'default')
        },
      })
    },
  }

  const identityStatusOptions = Object.entries(IDENTITY_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }))

  const columns: TableProps<Driver>['columns'] = [
    {
      title: 'Driver Name',
      dataIndex: 'name',
      render: (name, record) => (
        <Link to={`/drivers/${record.id}`} onClick={(e) => e.stopPropagation()}>
          {name}
        </Link>
      ),
    },
    { title: 'Driver ID', dataIndex: 'id' },
    { title: 'Rating', dataIndex: 'rating', render: (r: number) => `${r} ★` },
    { title: 'Completed Trips', dataIndex: 'completedTrips' },
    {
      title: 'Tier',
      dataIndex: 'currentTier',
      render: (tier?: string) => tier ? <Tag>{LEVEL_LABELS[tier] ?? tier}</Tag> : '—',
    },
    {
      title: 'Tier Progress',
      dataIndex: 'tierProgress',
      render: (progress?: number, record?: Driver) =>
        progress != null ? `${progress}% To ${nextTierLabel(record?.currentTier)}` : '—',
    },
    {
      title: 'Tier Status',
      dataIndex: 'tierStatus',
      render: (tierStatus?: Driver['tierStatus']) =>
        tierStatus ? <StatusBadge status={tierStatus === 'good_standing' ? 'active' : 'at_risk'} /> : '—',
    },
    { title: 'Vehicle', dataIndex: 'vehicle' },
    {
      title: 'Ride Categories',
      dataIndex: 'categories',
      render: (cats: Driver['categories']) => cats.map((c) => <Tag key={c}>{RIDE_CATEGORY_LABELS[c]}</Tag>),
    },
    { title: 'Compliance', dataIndex: 'complianceStatus', render: (s: string) => <StatusBadge status={s} /> },
    { title: 'Background Check', dataIndex: 'backgroundCheckStatus', render: (s: string) => <StatusBadge status={s} /> },
    {
      title: 'Identity Verification',
      dataIndex: 'identityVerificationStatus',
      render: (s: IdentityVerificationStatus) => <IdentityVerificationBadge status={s} />,
    },
    { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
    createActionsColumn(
      () => getDriverManagementActionItems(),
      (key, record) => handleDriverAction(key, record, adminActions, verificationHandlers),
    ),
  ]

  const segmentTable = (
    <Table
      loading={isLoading}
      columns={columns}
      dataSource={filtered}
      rowKey="id"
      scroll={{ x: 1500 }}
      {...createTableRowProps<Driver>((record) => openDrawer(record))}
      pagination={{
        current: page,
        total: data?.total,
        pageSize: 10,
        onChange: setPage,
        showSizeChanger: false,
      }}
    />
  )

  return (
    <PageShell title="Driver Management" description="Manage driver onboarding, compliance, identity verification, and lifecycle.">
      {validTab === 'overview' && <DriverVerificationOverviewCards />}

      {validTab === 'overview' && (
        <div className="glass-card mb-4 mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <TableFilters
              variant="inline"
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search drivers..."
              status={status}
              onStatusChange={setStatus}
              statusOptions={[
                { label: 'Active', value: 'active' },
                { label: 'Pending', value: 'pending' },
                { label: 'Suspended', value: 'suspended' },
                { label: 'Deactivated', value: 'deactivated' },
              ]}
            />
          </div>
          <Select
            placeholder="Filter by tier"
            value={tierFilter || undefined}
            onChange={setTierFilter}
            allowClear
            options={[
              { label: 'Journey', value: 'journey' },
              { label: 'Pro Go', value: 'pro_go' },
              { label: 'Elite', value: 'elite' },
              { label: 'Platinum', value: 'platinum' },
              { label: 'Diamond', value: 'diamond' },
            ]}
            className="!min-w-[180px] sm:mb-4"
          />
          <Select
            value={identityStatus || undefined}
            onChange={setIdentityStatus}
            allowClear
            options={identityStatusOptions}
            placeholder="Identity status"
            className="!min-w-[220px] sm:mb-4"
          />
        </div>
      )}

      <div className={`glass-card p-4 ${validTab === 'overview' ? '' : 'mt-6'}`}>
        <Tabs
          activeKey={validTab}
          onChange={(key) => {
            setPage(1)
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

function nextTierLabel(currentTier?: string) {
  const order = ['journey', 'pro_go', 'elite', 'platinum', 'diamond']
  const labels: Record<string, string> = {
    journey: 'Pro Go',
    pro_go: 'Elite',
    pro: 'Elite',
    elite: 'Platinum',
    platinum: 'Diamond',
    diamond: 'Diamond',
  }
  if (!currentTier) return 'Next Tier'
  const idx = order.indexOf(currentTier)
  return idx >= 0 ? labels[currentTier] : 'Next Tier'
}
