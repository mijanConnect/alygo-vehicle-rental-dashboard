import { Button, Descriptions, Tabs, Table } from 'antd'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PageShell } from '@/components/common/PageShell'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useGetPassengerByIdQuery } from '@/services/api'
import { formatCurrency, formatDate } from '@/utils/format'

export default function PassengerProfilePage() {
  const { id = '' } = useParams()
  const { data: passenger, isLoading } = useGetPassengerByIdQuery(id)
  useDocumentTitle(passenger ? `${passenger.name} - Passenger Profile` : 'Passenger Profile')

  if (isLoading) return null
  if (!passenger) {
    return (
      <PageShell title="Passenger Not Found">
        <Link to="/passengers"><Button icon={<ArrowLeft className="h-4 w-4" />}>Back</Button></Link>
      </PageShell>
    )
  }

  return (
    <PageShell title={passenger.name} description={`Passenger ID: ${passenger.id}`}>
      <div className="glass-card p-5">
        <Tabs
          items={[
            {
              key: 'profile',
              label: 'Profile',
              children: (
                <Descriptions column={2}>
                  <Descriptions.Item label="Email">{passenger.email}</Descriptions.Item>
                  <Descriptions.Item label="Phone">{passenger.phone}</Descriptions.Item>
                  <Descriptions.Item label="Rating">{passenger.rating} ★</Descriptions.Item>
                  <Descriptions.Item label="Trips">{passenger.completedTrips}</Descriptions.Item>
                  <Descriptions.Item label="Wallet">{formatCurrency(passenger.walletBalance)}</Descriptions.Item>
                  <Descriptions.Item label="Status"><StatusBadge status={passenger.status} /></Descriptions.Item>
                  <Descriptions.Item label="Joined">{formatDate(passenger.joinedAt)}</Descriptions.Item>
                  <Descriptions.Item label="City">{passenger.city}</Descriptions.Item>
                </Descriptions>
              ),
            },
            { key: 'payments', label: 'Payment Methods', children: <Table size="small" pagination={false} dataSource={[]} locale={{ emptyText: 'Stripe payment methods' }} /> },
            { key: 'trips', label: 'Trip History', children: <Table size="small" pagination={false} dataSource={[]} locale={{ emptyText: 'Trip history' }} /> },
            { key: 'support', label: 'Support History', children: <Table size="small" pagination={false} dataSource={[]} locale={{ emptyText: 'Support tickets' }} /> },
          ]}
        />
      </div>
      <Link to="/passengers"><Button icon={<ArrowLeft className="h-4 w-4" />}>Back to Passengers</Button></Link>
    </PageShell>
  )
}
