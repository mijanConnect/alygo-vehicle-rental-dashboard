import { Drawer, Empty, Image, Spin, Table, Tag } from 'antd'
import { Star } from 'lucide-react'
import { PhotoCompareView } from '@/features/drivers/components/PhotoCompareView'
import { IdentityVerificationBadge } from '@/features/drivers/components/IdentityVerificationBadge'
import { useGetSingleDriverQuery } from '@/redux/api/driverManagementApi'
import { formatDateTime } from '@/utils/format'
import type { IdentityVerificationStatus } from '@/types/driverVerification'

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') ?? ''

function resolveAssetUrl(path?: string | null) {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

interface DriverDetailsDrawerProps {
  open: boolean
  driverId: string | null
  onClose: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-alygo-text-muted">
        {title}
      </h4>
      <div className="space-y-2 text-sm text-white">{children}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <span className="min-w-[140px] text-alygo-text-muted">{label}</span>
      <span className="flex-1">{value || '—'}</span>
    </div>
  )
}

export function DriverDetailsDrawer({ open, driverId, onClose }: DriverDetailsDrawerProps) {
  const { data, isLoading, isError, isFetching } = useGetSingleDriverQuery(driverId ?? '', {
    skip: !open || !driverId,
  })

  const driver = data?.driver
  const identity = data?.identityVerification
  const images = data?.verificationImages
  const history = (data?.verificationHistory as Array<Record<string, unknown>>) ?? []

  const profilePhoto = resolveAssetUrl(images?.profilePhoto?.imageUrl)
  const liveSelfie = resolveAssetUrl(images?.latestLiveSelfie?.imageUrl)

  return (
    <Drawer
      title={driver ? driver.fullName || 'Driver Details' : 'Driver Details'}
      open={open}
      onClose={onClose}
      width={640}
      destroyOnClose
    >
      {isLoading || isFetching ? (
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      ) : isError || !data || !driver ? (
        <Empty description="Unable to load driver details" />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Tag>{driver.driverId}</Tag>
            <IdentityVerificationBadge
              status={
                (identity?.verificationStatus as IdentityVerificationStatus) ||
                'pending_re_verification'
              }
            />
          </div>

          <Section title="Personal Information">
            <Field label="Full Name" value={driver.fullName} />
            <Field label="Driver ID" value={driver.driverId} />
            <Field label="Email" value={driver.email} />
            <Field label="Phone" value={driver.phone} />
            <Field
              label="Rating"
              value={
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {driver.averageRating ?? 0}
                </span>
              }
            />
            <Field label="Completed Trips" value={driver.completedTrips} />
            {driver.avatar ? (
              <div className="mt-2">
                <Image
                  src={resolveAssetUrl(driver.avatar)}
                  alt={driver.fullName}
                  width={72}
                  height={72}
                  className="rounded-lg object-cover"
                  preview={{ mask: 'View' }}
                />
              </div>
            ) : null}
          </Section>

          <Section title="Vehicle Information">
            <Field label="Vehicle" value={driver.vehicleName} />
            <Field label="Plate Number" value={driver.vehicleNumber} />
          </Section>

          <Section title="Identity Verification">
            <Field label="Status" value={identity?.verificationStatus || '—'} />
            <Field label="Source" value={identity?.verificationSource || '—'} />
            <Field label="Verification Date" value={identity?.verificationDate || '—'} />
            <Field label="Last Verification" value={identity?.lastVerificationDate || '—'} />
            <Field label="Notes" value={identity?.verificationNotes || '—'} />
            <div className="mt-4">
              <PhotoCompareView
                profilePhoto={profilePhoto ?? ''}
                liveSelfiePhoto={liveSelfie}
                driverName={driver.fullName}
              />
            </div>
          </Section>

          <Section title="Verification History">
            {history.length > 0 ? (
              <Table
                size="small"
                pagination={{ pageSize: 5 }}
                rowKey={(_, index) => String(index)}
                dataSource={history}
                columns={[
                  {
                    title: 'Date',
                    dataIndex: 'date',
                    render: (d?: string) => (d ? formatDateTime(d) : '—'),
                  },
                  { title: 'Trigger', dataIndex: 'triggerSource' },
                  { title: 'Status', dataIndex: 'status' },
                  { title: 'Reviewed By', dataIndex: 'reviewedBy' },
                  { title: 'Notes', dataIndex: 'notes', ellipsis: true },
                ]}
              />
            ) : (
              <Empty description="No verification history" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Section>
        </>
      )}
    </Drawer>
  )
}
