import { Button, Descriptions, Spin, Tabs, Table } from 'antd'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PageShell } from '@/components/common/PageShell'
import { StatusBadge } from '@/components/common/StatusBadge'
import { mapPassengerDetails } from '@/features/passengers/mapPassengerManagement'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useGetSinglePassengerQuery } from '@/redux/api/passengersApi'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format'

export default function PassengerProfilePage() {
  const { id = '' } = useParams()
  const { data, isLoading } = useGetSinglePassengerQuery(id, { skip: !id })
  const passenger = data ? mapPassengerDetails(data) : null
  useDocumentTitle(
    passenger ? `${passenger.name} - Passenger Profile` : 'Passenger Profile',
  )

  if (isLoading) {
    return (
      <PageShell title="Passenger Profile">
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      </PageShell>
    )
  }

  if (!data || !passenger) {
    return (
      <PageShell title="Passenger Not Found">
        <Link to="/passengers">
          <Button icon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
        </Link>
      </PageShell>
    )
  }

  const { basicInformation, account, rideStatistics, wallet, recentTrips, recentReviews } =
    data

  return (
    <PageShell
      title={basicInformation.fullName || 'Passenger'}
      description={`Passenger ID: ${basicInformation.passengerId}`}
    >
      <div className="glass-card p-5">
        <Tabs
          items={[
            {
              key: 'profile',
              label: 'Profile',
              children: (
                <Descriptions column={2}>
                  <Descriptions.Item label="Email">
                    {basicInformation.email || '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    {basicInformation.phone || '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Gender">
                    {basicInformation.gender || '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Date of Birth">
                    {basicInformation.dateOfBirth
                      ? formatDate(basicInformation.dateOfBirth)
                      : '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Rating">
                    {rideStatistics.averageRating} ★
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <StatusBadge status={passenger.status} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Verification">
                    {account.verificationStatus || '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Joined">
                    {account.createdAt ? formatDate(account.createdAt) : '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Login">
                    {account.lastLogin ? formatDateTime(account.lastLogin) : '—'}
                  </Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: 'stats',
              label: 'Ride Statistics',
              children: (
                <Descriptions column={2}>
                  <Descriptions.Item label="Total Trips">
                    {rideStatistics.totalTrips}
                  </Descriptions.Item>
                  <Descriptions.Item label="Completed">
                    {rideStatistics.completedTrips}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cancelled">
                    {rideStatistics.cancelledTrips}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Distance">
                    {rideStatistics.totalDistance}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Spent">
                    {formatCurrency(rideStatistics.totalSpent)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Average Rating">
                    {rideStatistics.averageRating} ★
                  </Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: 'wallet',
              label: 'Wallet',
              children: (
                <Descriptions column={2}>
                  <Descriptions.Item label="Current Balance">
                    {formatCurrency(wallet.currentBalance)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Deposits">
                    {formatCurrency(wallet.totalDeposits)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Spent">
                    {formatCurrency(wallet.totalSpent)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Refunds">
                    {formatCurrency(wallet.totalRefunds)}
                  </Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: 'trips',
              label: 'Recent Trips',
              children: (
                <Table
                  size="small"
                  pagination={false}
                  rowKey={(_, i) => String(i)}
                  dataSource={(recentTrips as Array<Record<string, unknown>>) ?? []}
                  locale={{ emptyText: 'No recent trips' }}
                  columns={[
                    { title: 'Trip', dataIndex: 'tripId' },
                    { title: 'Status', dataIndex: 'status' },
                    {
                      title: 'Fare',
                      dataIndex: 'fare',
                      render: (v?: number) =>
                        typeof v === 'number' ? formatCurrency(v) : '—',
                    },
                  ]}
                />
              ),
            },
            {
              key: 'reviews',
              label: 'Recent Reviews',
              children: (
                <Table
                  size="small"
                  pagination={false}
                  rowKey={(_, i) => String(i)}
                  dataSource={(recentReviews as Array<Record<string, unknown>>) ?? []}
                  locale={{ emptyText: 'No recent reviews' }}
                  columns={[
                    { title: 'Rating', dataIndex: 'rating' },
                    { title: 'Comment', dataIndex: 'comment', ellipsis: true },
                  ]}
                />
              ),
            },
          ]}
        />
      </div>
      <Link to="/passengers" className="mt-4 inline-block">
        <Button icon={<ArrowLeft className="h-4 w-4" />}>Back to Passengers</Button>
      </Link>
    </PageShell>
  )
}
