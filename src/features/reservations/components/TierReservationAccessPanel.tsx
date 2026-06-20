import { Table, Tag } from 'antd'
import { Link } from 'react-router-dom'
import { useGetDriverLevelsQuery } from '@/services/driverRewardsApi'
import { formatReservationAccess } from '@/features/driver-rewards/utils/tierConfigHelpers'
import { TIER_MANAGEMENT_PATH } from '@/features/driver-rewards/utils/tierDefaults'

export function TierReservationAccessPanel() {
  const { data: levels = [], isLoading } = useGetDriverLevelsQuery()

  return (
    <div className="glass-card mb-6 p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">Tier Reservation Access</h3>
          <p className="mt-1 text-sm text-alygo-text-muted">
            Reservation eligibility is configured in{' '}
            <Link to={TIER_MANAGEMENT_PATH} className="text-indigo-400 hover:text-indigo-300">
              Tier Management
            </Link>
            . This panel is read-only.
          </p>
        </div>
      </div>
      <Table
        loading={isLoading}
        rowKey="id"
        size="small"
        pagination={false}
        dataSource={[...levels].sort((a, b) => a.sortOrder - b.sortOrder)}
        scroll={{ x: 900 }}
        columns={[
          {
            title: 'Tier',
            dataIndex: 'label',
            render: (label: string, record) => (
              <span className="inline-flex items-center gap-2">
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold text-white"
                  style={{ backgroundColor: record.tierColor }}
                >
                  {record.tierBadge}
                </span>
                <Tag>{label}</Tag>
              </span>
            ),
          },
          {
            title: 'Reservation Access',
            render: (_, record) => formatReservationAccess(record.benefits.reservationAccess),
          },
          {
            title: 'Advance Booking',
            render: (_, record) => (record.benefits.advanceBookingAccess ? 'Yes' : 'No'),
          },
          {
            title: 'Priority',
            dataIndex: ['benefits', 'reservationPriority'],
          },
          {
            title: 'Max Distance (mi)',
            dataIndex: ['benefits', 'maxReservationDistanceMiles'],
          },
          {
            title: 'Queue Priority',
            dataIndex: ['benefits', 'reservationQueuePriority'],
          },
        ]}
      />
    </div>
  )
}
