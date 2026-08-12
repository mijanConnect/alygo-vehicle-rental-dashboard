import { Drawer, Empty, Image, Spin, Tag } from 'antd'
import { Star } from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useGetSinglePassengerQuery } from '@/redux/api/passengersApi'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format'

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') ?? ''

function resolveAssetUrl(path?: string | null) {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

interface PassengerDetailsDrawerProps {
  open: boolean
  passengerId: string | null
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

export function PassengerDetailsDrawer({
  open,
  passengerId,
  onClose,
}: PassengerDetailsDrawerProps) {
  const { data, isLoading, isError, isFetching } = useGetSinglePassengerQuery(
    passengerId ?? '',
    { skip: !open || !passengerId },
  )

  const basic = data?.basicInformation
  const account = data?.account
  const rides = data?.rideStatistics
  const wallet = data?.wallet

  return (
    <Drawer
      title={basic ? basic.fullName || 'Passenger Details' : 'Passenger Details'}
      open={open}
      onClose={onClose}
      width={560}
      destroyOnClose
    >
      {isLoading || isFetching ? (
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      ) : isError || !data || !basic ? (
        <Empty description="Unable to load passenger details" />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Tag>{basic.passengerId}</Tag>
            <StatusBadge status={account?.accountStatus || 'active'} />
          </div>

          <Section title="Basic Information">
            <Field label="Full Name" value={basic.fullName} />
            <Field label="Passenger ID" value={basic.passengerId} />
            <Field label="Email" value={basic.email} />
            <Field label="Phone" value={basic.phone} />
            <Field label="Gender" value={basic.gender} />
            <Field
              label="Date of Birth"
              value={basic.dateOfBirth ? formatDate(basic.dateOfBirth) : '—'}
            />
            {basic.avatar ? (
              <div className="mt-2">
                <Image
                  src={resolveAssetUrl(basic.avatar)}
                  alt={basic.fullName}
                  width={72}
                  height={72}
                  className="rounded-lg object-cover"
                  preview={{ mask: 'View' }}
                />
              </div>
            ) : null}
          </Section>

          <Section title="Account">
            <Field
              label="Status"
              value={<StatusBadge status={account?.accountStatus || 'active'} />}
            />
            <Field label="Verification" value={account?.verificationStatus} />
            <Field
              label="Created At"
              value={account?.createdAt ? formatDateTime(account.createdAt) : '—'}
            />
            <Field
              label="Last Login"
              value={account?.lastLogin ? formatDateTime(account.lastLogin) : '—'}
            />
          </Section>

          <Section title="Ride Statistics">
            <Field label="Total Trips" value={rides?.totalTrips} />
            <Field label="Completed Trips" value={rides?.completedTrips} />
            <Field label="Cancelled Trips" value={rides?.cancelledTrips} />
            <Field label="Total Distance" value={rides?.totalDistance} />
            <Field
              label="Total Spent"
              value={formatCurrency(rides?.totalSpent ?? 0)}
            />
            <Field
              label="Rating"
              value={
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {rides?.averageRating ?? 0}
                </span>
              }
            />
          </Section>

          <Section title="Wallet">
            <Field
              label="Current Balance"
              value={formatCurrency(wallet?.currentBalance ?? 0)}
            />
            <Field
              label="Total Deposits"
              value={formatCurrency(wallet?.totalDeposits ?? 0)}
            />
            <Field label="Total Spent" value={formatCurrency(wallet?.totalSpent ?? 0)} />
            <Field
              label="Total Refunds"
              value={formatCurrency(wallet?.totalRefunds ?? 0)}
            />
          </Section>
        </>
      )}
    </Drawer>
  )
}
