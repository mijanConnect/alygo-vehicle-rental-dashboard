import { useMemo, useState } from 'react'
import { Table, Tag } from 'antd'
import type { Dayjs } from 'dayjs'
import { Eye, Pencil, Trash2, UserPlus, XCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import type { ActionMenuItem } from '@/components/admin/types'
import { PageShell } from '@/components/common/PageShell'
import { StatusBadge } from '@/components/common/StatusBadge'
import { RIDE_CATEGORY_LABELS } from '@/constants'
import { ReservationDetailsDrawer } from '@/features/reservations/components/ReservationDetailsDrawer'
import { ReservationFilterBar } from '@/features/reservations/components/ReservationFilterBar'
import { ReservationOverviewCards } from '@/features/reservations/components/ReservationOverviewCards'
import {
  filterReservations,
  RESERVATION_TYPE_LABELS,
  type ReservationFilters,
} from '@/features/reservations/reservationData'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useGetReservationsQuery } from '@/services/api'
import type { Reservation } from '@/types'
import { formatDateTime } from '@/utils/format'

function getReservationActionItems(record: Reservation): ActionMenuItem[] {
  return [
    { key: 'view', label: 'View', icon: Eye, group: 0 },
    { key: 'edit', label: 'Edit', icon: Pencil, group: 1 },
    {
      key: 'assign',
      label: record.driverName ? 'Reassign Driver' : 'Assign Driver',
      icon: UserPlus,
      group: 1,
    },
    { key: 'cancel', label: 'Cancel', icon: XCircle, danger: true, group: 2 },
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 },
  ]
}

export default function ReservationCenterPage() {
  useDocumentTitle('Reservation Center')
  const adminActions = useAdminActions()
  const [searchParams] = useSearchParams()
  const typeFromUrl = searchParams.get('type') ?? ''

  const { data: allReservations = [], isLoading } = useGetReservationsQuery()

  const [filters, setFilters] = useState<ReservationFilters>({
    type: typeFromUrl,
    status: '',
    search: '',
    driver: '',
    passenger: '',
    airport: '',
    city: '',
  })
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [selected, setSelected] = useState<Reservation | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const effectiveFilters = useMemo(
    () => ({ ...filters, type: filters.type || typeFromUrl }),
    [filters, typeFromUrl],
  )

  const filtered = useMemo(
    () => filterReservations(allReservations, effectiveFilters),
    [allReservations, effectiveFilters],
  )

  const openDetails = (record: Reservation) => {
    setSelected(record)
    setDrawerOpen(true)
  }

  const handleAction = (key: string, record: Reservation) => {
    switch (key) {
      case 'view':
      case 'edit':
        openDetails(record)
        break
      case 'assign':
        openDetails(record)
        adminActions.notify('Open Driver Assignment tab to assign a driver', record.id)
        break
      case 'cancel':
        adminActions.openConfirm({
          title: 'Cancel Reservation',
          description: `Cancel reservation ${record.id}?`,
          confirmLabel: 'Cancel Reservation',
          danger: true,
          onConfirm: async () => adminActions.notify('Reservation cancelled', record.id),
        })
        break
      case 'delete':
        adminActions.openConfirm({
          title: 'Delete Reservation',
          description: `Permanently delete reservation ${record.id}?`,
          confirmLabel: 'Delete',
          danger: true,
          onConfirm: async () => adminActions.notify('Reservation deleted', record.id),
        })
        break
    }
  }

  return (
    <PageShell
      title="Reservation Center"
      description="Monitor reservations, assign drivers, manage status, and review booking history. Reservations originate from passenger mobile, web, airport, event, corporate, and API channels."
    >
      <ReservationOverviewCards reservations={allReservations} />

      <ReservationFilterBar
        filters={effectiveFilters}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        dateRange={dateRange}
        onDateRangeChange={(from, to, range) => {
          setFilters((prev) => ({ ...prev, dateFrom: from, dateTo: to }))
          setDateRange(range ?? null)
        }}
      />

      <div className="glass-card p-4">
        <Table
          loading={isLoading}
          rowKey="id"
          dataSource={filtered}
          scroll={{ x: 1400 }}
          {...createTableRowProps<Reservation>((record) => openDetails(record))}
          columns={[
            { title: 'Reservation ID', dataIndex: 'id', width: 120 },
            {
              title: 'Type',
              dataIndex: 'type',
              render: (t: Reservation['type']) => <Tag>{RESERVATION_TYPE_LABELS[t]}</Tag>,
            },
            { title: 'Passenger', dataIndex: 'passengerName' },
            { title: 'Pickup', dataIndex: 'pickup', ellipsis: true },
            { title: 'Dropoff', dataIndex: 'dropoff', ellipsis: true },
            {
              title: 'Scheduled Time',
              dataIndex: 'scheduledAt',
              render: (d: string) => formatDateTime(d),
            },
            {
              title: 'Assigned Driver',
              dataIndex: 'driverName',
              render: (d?: string) => d ?? 'Unassigned',
            },
            {
              title: 'Category',
              dataIndex: 'category',
              render: (c: Reservation['category']) => RIDE_CATEGORY_LABELS[c],
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (s: string) => <StatusBadge status={s} />,
            },
            {
              title: 'Created Date',
              dataIndex: 'createdAt',
              render: (d: string) => formatDateTime(d),
            },
            createActionsColumn<Reservation>(
              (record) => getReservationActionItems(record),
              (key, record) => handleAction(key, record),
            ),
          ]}
        />
      </div>

      <ReservationDetailsDrawer
        reservation={selected}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelected(null)
        }}
      />

      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
