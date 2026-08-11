import { Button, Descriptions, Spin, Tabs, Table, Tag } from 'antd'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { AdminActionHost } from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { StatusBadge } from '@/components/common/StatusBadge'
import { DriverVerificationDrawer } from '@/features/drivers/components/DriverVerificationDrawer'
import { IdentityVerificationBadge } from '@/features/drivers/components/IdentityVerificationBadge'
import { PhotoCompareView } from '@/features/drivers/components/PhotoCompareView'
import { mapDriverDetailsToDriver } from '@/features/drivers/mapDriverManagement'
import { DriverTierRewardsTab } from '@/features/driver-rewards/components/DriverTierRewardsTab'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useGetSingleDriverQuery } from '@/redux/api/driverManagementApi'
import { formatDateTime } from '@/utils/format'

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') ?? ''

function resolveAssetUrl(path?: string | null) {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

export default function DriverProfilePage() {
  const { id = '' } = useParams()
  const adminActions = useAdminActions()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { data, isLoading } = useGetSingleDriverQuery(id, { skip: !id })
  const driverRow = data ? mapDriverDetailsToDriver(data) : null
  useDocumentTitle(driverRow ? `${driverRow.name} - Driver Profile` : 'Driver Profile')

  if (isLoading) {
    return (
      <PageShell title="Driver Profile">
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      </PageShell>
    )
  }

  if (!data || !driverRow) {
    return (
      <PageShell title="Driver Not Found">
        <Link to="/drivers">
          <Button icon={<ArrowLeft className="h-4 w-4" />}>Back to Drivers</Button>
        </Link>
      </PageShell>
    )
  }

  const { driver, identityVerification, verificationImages, verificationHistory } = data
  const profilePhoto = resolveAssetUrl(verificationImages.profilePhoto?.imageUrl)
  const liveSelfie = resolveAssetUrl(verificationImages.latestLiveSelfie?.imageUrl)

  return (
    <PageShell
      title={driver.fullName || 'Driver'}
      description={`Driver ID: ${driver.driverId}`}
      actions={
        <div className="flex gap-2">
          <Button
            onClick={() =>
              adminActions.openApproval({
                title: 'Approve Driver',
                entityLabel: driver.fullName,
                onApprove: async () => adminActions.notify('Driver approved', driver.fullName),
              })
            }
          >
            Approve
          </Button>
          <Button
            danger
            onClick={() =>
              adminActions.openSuspension({
                title: 'Suspend Driver',
                entityLabel: `Suspend ${driver.fullName}`,
                onConfirm: async () => adminActions.notify('Driver suspended', driver.fullName),
              })
            }
          >
            Suspend
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-1">
          <Descriptions column={1} size="small" title="Personal Information">
            <Descriptions.Item label="Email">{driver.email || '—'}</Descriptions.Item>
            <Descriptions.Item label="Phone">{driver.phone || '—'}</Descriptions.Item>
            <Descriptions.Item label="Rating">{driver.averageRating} ★</Descriptions.Item>
            <Descriptions.Item label="Completed Trips">
              {driver.completedTrips}
            </Descriptions.Item>
            <Descriptions.Item label="Identity">
              <IdentityVerificationBadge
                status={driverRow.identityVerificationStatus}
              />
            </Descriptions.Item>
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
                    <Descriptions.Item label="Vehicle">
                      {driver.vehicleName || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Plate">
                      {driver.vehicleNumber || '—'}
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: 'identity',
                label: 'Identity Verification',
                children: (
                  <div className="space-y-6">
                    <Descriptions column={2} size="small" bordered>
                      <Descriptions.Item label="Status">
                        <Tag>{identityVerification.verificationStatus}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Verification Source">
                        {identityVerification.verificationSource || '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Verification Date">
                        {identityVerification.verificationDate || '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Last Verification Date">
                        {identityVerification.lastVerificationDate || '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Verification Notes" span={2}>
                        {identityVerification.verificationNotes || '—'}
                      </Descriptions.Item>
                    </Descriptions>

                    <PhotoCompareView
                      profilePhoto={profilePhoto ?? ''}
                      liveSelfiePhoto={liveSelfie}
                      driverName={driver.fullName}
                    />

                    <Table
                      size="small"
                      pagination={{ pageSize: 5 }}
                      rowKey={(_, index) => String(index)}
                      dataSource={(verificationHistory as Array<Record<string, unknown>>) ?? []}
                      locale={{ emptyText: 'No verification history' }}
                      columns={[
                        {
                          title: 'Date',
                          dataIndex: 'date',
                          render: (d?: string) => (d ? formatDateTime(d) : '—'),
                        },
                        { title: 'Trigger Source', dataIndex: 'triggerSource' },
                        { title: 'Status', dataIndex: 'status' },
                        { title: 'Reviewed By', dataIndex: 'reviewedBy' },
                        { title: 'Notes', dataIndex: 'notes', ellipsis: true },
                      ]}
                    />

                    <Button type="primary" onClick={() => setDrawerOpen(true)}>
                      Open Full Verification Review
                    </Button>
                  </div>
                ),
              },
              {
                key: 'tier-rewards',
                label: 'Tier & Rewards',
                children: (
                  <DriverTierRewardsTab
                    driverId={driver.driverId}
                    driverName={driver.fullName}
                  />
                ),
              },
              {
                key: 'compliance',
                label: 'Compliance',
                children: (
                  <Descriptions column={1}>
                    <Descriptions.Item label="Identity Verification">
                      <IdentityVerificationBadge
                        status={driverRow.identityVerificationStatus}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <StatusBadge status={driverRow.status} />
                    </Descriptions.Item>
                  </Descriptions>
                ),
              },
            ]}
          />
        </div>
      </div>

      <Link to="/drivers" className="mt-4 inline-block">
        <Button icon={<ArrowLeft className="h-4 w-4" />}>Back to Drivers</Button>
      </Link>

      <DriverVerificationDrawer
        open={drawerOpen}
        driver={driverRow}
        onClose={() => setDrawerOpen(false)}
      />
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
