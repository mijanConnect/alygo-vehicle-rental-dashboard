import { useState } from 'react'
import { Button, Table, Tag } from 'antd'
import { Plus } from 'lucide-react'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
} from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { TableFilters } from '@/components/common/TableFilters'
import { Pagination } from '@/components/shared/Pagination'
import {
  EVENT_STATUS_OPTIONS,
  getEventActionItems,
  getEventStatusColor,
  getEventStatusLabel,
} from '@/features/events/eventHelpers'
import { EventFormModal } from '@/features/events/components/EventFormModal'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useCreateEventMutation,
  useDeleteEventMutation,
  useGetEventsListQuery,
  useUpdateEventMutation,
  useUpdateEventStatusMutation,
  type EventItem,
  type EventStatus,
  type EventWritePayload,
} from '@/redux/api/eventsManageApi'
import { formatDateTime } from '@/utils/format'

export default function EventsManagementPage() {
  useDocumentTitle('Events Management')
  const adminActions = useAdminActions()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<EventItem | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<EventItem | null>(null)

  const { data, isLoading, isFetching } = useGetEventsListQuery({
    page,
    limit,
    searchTerm,
    status: status || undefined,
  })

  const rows = data?.data ?? []
  const meta = data?.meta

  const [createEvent, { isLoading: creating }] = useCreateEventMutation()
  const [updateEvent, { isLoading: updating }] = useUpdateEventMutation()
  const [deleteEvent, { isLoading: deleting }] = useDeleteEventMutation()
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateEventStatusMutation()

  const handleAction = async (key: string, record: EventItem) => {
    switch (key) {
      case 'edit':
        setEditRecord(record)
        break
      case 'toggle': {
        const nextStatus: EventStatus = record.status === 'active' ? 'inactive' : 'active'
        try {
          await updateStatus({ id: record._id, status: nextStatus }).unwrap()
          adminActions.notify(
            nextStatus === 'active' ? 'Event activated' : 'Event deactivated',
            record.eventName,
          )
        } catch (err) {
          adminActions.notify('Unable to update event status', String(err))
        }
        break
      }
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  const handleCreate = async (payload: EventWritePayload) => {
    try {
      await createEvent(payload).unwrap()
      adminActions.notify('Event created', payload.eventName)
      setFormOpen(false)
    } catch (err) {
      adminActions.notify('Unable to create event', String(err))
    }
  }

  const handleUpdate = async (payload: EventWritePayload) => {
    if (!editRecord) return
    try {
      await updateEvent({ id: editRecord._id, body: payload }).unwrap()
      adminActions.notify('Event updated', editRecord.eventName)
      setEditRecord(null)
    } catch (err) {
      adminActions.notify('Unable to update event', String(err))
    }
  }

  const handleDelete = async () => {
    if (!deleteRecord) return
    try {
      await deleteEvent(deleteRecord._id).unwrap()
      adminActions.notify('Event deleted', deleteRecord.eventName)
      setDeleteRecord(null)
    } catch (err) {
      adminActions.notify('Unable to delete event', String(err))
    }
  }

  return (
    <PageShell
      title="Events Management"
      description="Manage demand events, coverage areas, and schedules."
      actions={
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
          Create Event
        </Button>
      }
    >
      <TableFilters
        search={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value)
          setPage(1)
        }}
        searchPlaceholder="Search events..."
        statusOptions={EVENT_STATUS_OPTIONS}
        status={status}
        onStatusChange={(value) => {
          setStatus(value ?? '')
          setPage(1)
        }}
      />

      <div className="glass-card p-4">
        <Table
          loading={isLoading || isFetching || updatingStatus}
          rowKey="_id"
          dataSource={rows}
          pagination={false}
          scroll={{ x: 1200 }}
          columns={[
            { title: 'Event Name', dataIndex: 'eventName' },
            {
              title: 'Description',
              dataIndex: 'description',
              ellipsis: true,
            },
            { title: 'Timezone', dataIndex: 'timezone', width: 140 },
            {
              title: 'Start',
              dataIndex: 'startDateTime',
              render: (d: string) => (d ? formatDateTime(d) : '—'),
            },
            {
              title: 'End',
              dataIndex: 'endDateTime',
              render: (d: string) => (d ? formatDateTime(d) : '—'),
            },
            {
              title: 'Radius',
              dataIndex: 'coverageRadiusKm',
              render: (v: number) => `${v} km`,
              width: 90,
            },
            {
              title: 'Coordinates',
              render: (_: unknown, record: EventItem) => {
                const [lng, lat] = record.location?.coordinates ?? []
                return typeof lat === 'number' && typeof lng === 'number'
                  ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
                  : '—'
              },
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (s: EventStatus) => (
                <Tag color={getEventStatusColor(s)}>{getEventStatusLabel(s)}</Tag>
              ),
            },
            createActionsColumn<EventItem>(
              (record) => getEventActionItems(record),
              (key, record) => void handleAction(key, record),
            ),
          ]}
        />
      </div>

      <Pagination
        currentPage={meta?.page ?? page}
        totalPages={Math.max(meta?.totalPages ?? 1, 1)}
        totalItems={meta?.totalItems ?? 0}
        itemsPerPage={meta?.limit ?? limit}
        onPageChange={setPage}
        onItemsPerPageChange={(size) => {
          setLimit(size)
          setPage(1)
        }}
      />

      <EventFormModal
        open={formOpen}
        mode="create"
        loading={creating}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      <EventFormModal
        open={Boolean(editRecord)}
        mode="edit"
        initialValues={editRecord}
        loading={updating}
        onCancel={() => setEditRecord(null)}
        onSubmit={handleUpdate}
      />

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteRecord(null)}
      />

      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
