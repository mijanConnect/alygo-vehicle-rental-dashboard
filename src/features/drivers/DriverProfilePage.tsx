import { Button, Descriptions, Tabs, Table, Tag } from 'antd'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { AdminActionHost } from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { StatusBadge } from '@/components/common/StatusBadge'
import { DriverVerificationDrawer } from '@/features/drivers/components/DriverVerificationDrawer'
import { IdentityVerificationBadge } from '@/features/drivers/components/IdentityVerificationBadge'
import { PhotoCompareView } from '@/features/drivers/components/PhotoCompareView'
import { RIDE_CATEGORY_LABELS } from '@/constants'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useGetDriverByIdQuery } from '@/services/api'
import {
  useGetDriverVerificationQuery,
  useGetVerificationHistoryQuery,
  VERIFICATION_SOURCE_LABELS,
} from '@/services/driverVerificationApi'
import { DriverTierRewardsTab } from '@/features/driver-rewards/components/DriverTierRewardsTab'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format'

export default function DriverProfilePage() {
  const { id = '' } = useParams()
  const adminActions = useAdminActions()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { data: driver, isLoading } = useGetDriverByIdQuery(id)
  const { data: verification } = useGetDriverVerificationQuery(id, { skip: !id })
  const { data: history = [] } = useGetVerificationHistoryQuery(id, { skip: !id })
  useDocumentTitle(driver ? `${driver.name} - Driver Profile` : 'Driver Profile')

  if (isLoading) return null
  if (!driver) {
    return (
      <PageShell title="Driver Not Found">
        <Link to="/drivers"><Button icon={<ArrowLeft className="h-4 w-4" />}>Back to Drivers</Button></Link>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={driver.name}
      description={`Driver ID: ${driver.id}`}
      actions={
        <SpaceActions driver={driver} adminActions={adminActions} />
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-1">
          <Descriptions column={1} size="small" title="Personal Information">
            <Descriptions.Item label="Email">{driver.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{driver.phone}</Descriptions.Item>
            <Descriptions.Item label="City">{driver.city}, {driver.state}</Descriptions.Item>
            <Descriptions.Item label="Joined">{formatDate(driver.joinedAt)}</Descriptions.Item>
            <Descriptions.Item label="Rating">{driver.rating} ★</Descriptions.Item>
            <Descriptions.Item label="Status"><StatusBadge status={driver.status} /></Descriptions.Item>
          </Descriptions>
        </div>
        <div className="glass-card p-5 lg:col-span-2">
          <Tabs
            items={[
              {
                key: 'vehicle',
                label: 'Vehicle Information',
                children: (
                  <Descriptions column={2}>
                    <Descriptions.Item label="Vehicle">{driver.vehicle}</Descriptions.Item>
                    <Descriptions.Item label="Year">{driver.vehicleYear}</Descriptions.Item>
                    <Descriptions.Item label="Categories">
                      {driver.categories.map((c) => <Tag key={c}>{RIDE_CATEGORY_LABELS[c]}</Tag>)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Earnings">{formatCurrency(driver.earnings)}</Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'documents',
                label: 'Documents',
                children: <Table size="small" pagination={false} dataSource={[]} locale={{ emptyText: 'Document records loaded from compliance module' }} />,
              },
              {
                key: 'trips',
                label: 'Trip History',
                children: <Table size="small" pagination={false} dataSource={[]} locale={{ emptyText: 'Trip history available via operations module' }} />,
              },
              {
                key: 'compliance',
                label: 'Compliance History',
                children: (
                  <Descriptions column={1}>
                    <Descriptions.Item label="Compliance"><StatusBadge status={driver.complianceStatus} /></Descriptions.Item>
                    <Descriptions.Item label="Background Check"><StatusBadge status={driver.backgroundCheckStatus} /></Descriptions.Item>
                    <Descriptions.Item label="Identity Verification">
                      <IdentityVerificationBadge status={driver.identityVerificationStatus} />
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'identity',
                label: 'Identity Verification',
                children: verification ? (
                  <div className="space-y-6">
                    <Descriptions column={2} size="small" bordered>
                      <Descriptions.Item label="Status">
                        <IdentityVerificationBadge status={verification.status} />
                      </Descriptions.Item>
                      <Descriptions.Item label="Verification Source">
                        {VERIFICATION_SOURCE_LABELS[verification.verificationSource]}
                      </Descriptions.Item>
                      <Descriptions.Item label="Verification Date">
                        {verification.verifiedAt ? formatDateTime(verification.verifiedAt) : '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Verification Date">
                        {verification.lastVerifiedAt ? formatDateTime(verification.lastVerifiedAt) : '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Verification Notes" span={2}>
                        {verification.verificationNotes ?? '—'}
                      </Descriptions.Item>
                    </Descriptions>
                    <PhotoCompareView
                      profilePhoto={verification.profilePhoto}
                      liveSelfiePhoto={verification.liveSelfiePhoto}
                      driverName={driver.name}
                    />
                    <Table
                      size="small"
                      pagination={{ pageSize: 5 }}
                      rowKey="id"
                      dataSource={history}
                      columns={[
                        { title: 'Date', dataIndex: 'date', render: (d: string) => formatDateTime(d) },
                        { title: 'Trigger Source', dataIndex: 'triggerSource' },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          render: (s: typeof verification.status) => <IdentityVerificationBadge status={s} />,
                        },
                        { title: 'Reviewed By', dataIndex: 'reviewedBy' },
                        { title: 'Notes', dataIndex: 'notes', ellipsis: true },
                      ]}
                    />
                    <Button type="primary" onClick={() => setDrawerOpen(true)}>
                      Open Full Verification Review
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-alygo-text-muted">No verification record found.</p>
                ),
              },
              {
                key: 'tier-rewards',
                label: 'Tier & Rewards',
                children: <DriverTierRewardsTab driverId={driver.id} driverName={driver.name} />,
              },
            ]}
          />
        </div>
      </div>
      <Link to="/drivers"><Button icon={<ArrowLeft className="h-4 w-4" />}>Back to Drivers</Button></Link>
      <DriverVerificationDrawer open={drawerOpen} driver={driver} onClose={() => setDrawerOpen(false)} />
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}

function SpaceActions({
  driver,
  adminActions,
}: {
  driver: NonNullable<ReturnType<typeof useGetDriverByIdQuery>['data']>
  adminActions: ReturnType<typeof useAdminActions>
}) {
  return (
    <div className="flex gap-2">
      <Button onClick={() => adminActions.openApproval({
        title: 'Approve Driver',
        entityLabel: driver.name,
        onApprove: async () => adminActions.notify('Driver approved', driver.name),
      })}>Approve</Button>
      <Button danger onClick={() => adminActions.openSuspension({
        title: 'Suspend Driver',
        entityLabel: `Suspend ${driver.name}`,
        onConfirm: async () => adminActions.notify('Driver suspended', driver.name),
      })}>Suspend</Button>
      <Button type="primary" onClick={() => adminActions.openConfirm({
        title: 'Reactivate Driver',
        description: `Restore access for ${driver.name}?`,
        confirmLabel: 'Reactivate',
        onConfirm: async () => adminActions.notify('Driver reactivated', driver.name),
      })}>Reactivate</Button>
    </div>
  )
}
