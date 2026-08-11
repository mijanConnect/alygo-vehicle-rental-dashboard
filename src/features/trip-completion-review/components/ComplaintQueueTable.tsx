import { useCallback, useState } from 'react'
import { Form, Input, Modal, Select, Table, Tag } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetAllTripReportsQuery,
  useUpdateAdminTripCompletionComplaintMutation,
  type TripComplaintAdminStatus,
  type TripComplaintRow,
} from '@/redux/api/tripReportApi'
import {
  COMPLAINT_STATUS_LABELS,
  getComplaintActionItems,
} from '@/features/trip-completion-review/tripCompletionReviewHelpers'
import { ComplaintReviewDrawer } from '@/features/trip-completion-review/components/ComplaintReviewDrawer'
import { formatCurrency, formatDateTime } from '@/utils/format'

interface ComplaintQueueTableProps {
  filter?: (complaint: TripComplaintRow) => boolean
  description?: string
}

const STATUS_OPTIONS: { value: TripComplaintAdminStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'resolved', label: 'Resolved' },
]

export function ComplaintQueueTable({
  filter,
  description,
}: ComplaintQueueTableProps = {}) {
  const adminActions = useAdminActions()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [statusRecord, setStatusRecord] = useState<TripComplaintRow | null>(null)
  const [statusForm] = Form.useForm<{
    status: TripComplaintAdminStatus
    adminNote: string
  }>()

  const { data, isLoading, isFetching } = useGetAllTripReportsQuery({
    page,
    limit,
    searchTerm,
  })

  const [updateComplaint, { isLoading: updating }] =
    useUpdateAdminTripCompletionComplaintMutation()

  const rows = filter ? (data?.data ?? []).filter(filter) : (data?.data ?? [])
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.totalItems ?? 0

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    setPage(1)
  }, [])

  const handleItemsPerPageChange = (nextLimit: number) => {
    setLimit(nextLimit)
    setPage(1)
  }

  const handleAction = (key: string, record: TripComplaintRow) => {
    switch (key) {
      case 'view':
        setSelectedId(record.complaintId)
        break
      case 'update-status':
        statusForm.setFieldsValue({
          status:
            record.status === 'investigating' || record.status === 'resolved'
              ? record.status
              : 'open',
          adminNote: '',
        })
        setStatusRecord(record)
        break
    }
  }

  return (
    <>
      {description && (
        <p className="mb-4 text-sm text-alygo-text-muted">{description}</p>
      )}

      <div className="mb-4">
        <SearchingInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by complaint, passenger, driver..."
        />
      </div>

      <Table
        loading={isLoading || isFetching}
        rowKey="id"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 1200 }}
        {...createTableRowProps<TripComplaintRow>((record) =>
          setSelectedId(record.complaintId),
        )}
        columns={[
          {
            title: 'Complaint ID',
            dataIndex: 'complaintId',
            width: 170,
            render: (id: string) => (
              <span className="font-mono text-xs text-white">{id}</span>
            ),
          },
          {
            title: 'Ride ID',
            dataIndex: 'rideId',
            width: 120,
            render: (id: string) => (
              <span className="font-mono text-xs text-white">
                {id ? id.slice(-8) : '—'}
              </span>
            ),
          },
          { title: 'Passenger', dataIndex: 'passengerName' },
          { title: 'Driver', dataIndex: 'driverName' },
          { title: 'Type', dataIndex: 'complaintType' },
          {
            title: 'Distance Delta',
            dataIndex: 'distanceDeltaMeters',
            width: 130,
            render: (m: number) => `${m}m`,
          },
          {
            title: 'Fare',
            dataIndex: 'fare',
            width: 100,
            render: (f: number) => formatCurrency(f),
          },
          {
            title: 'Reported',
            dataIndex: 'reportedAt',
            width: 170,
            render: (d: string) => formatDateTime(d),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            width: 130,
            render: (s: string) => (
              <Tag>{COMPLAINT_STATUS_LABELS[s] ?? s.replace(/_/g, ' ')}</Tag>
            ),
          },
          createActionsColumn<TripComplaintRow>(
            (record) => getComplaintActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      <Pagination
        currentPage={page}
        totalPages={Math.max(totalPages, 1)}
        totalItems={totalItems}
        itemsPerPage={limit}
        onPageChange={setPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      <ComplaintReviewDrawer
        open={Boolean(selectedId)}
        complaintId={selectedId}
        onClose={() => setSelectedId(null)}
      />

      <Modal
        title={`Update Status — ${statusRecord?.complaintId ?? ''}`}
        open={Boolean(statusRecord)}
        confirmLoading={updating}
        onCancel={() => setStatusRecord(null)}
        onOk={() => statusForm.submit()}
        okText="Save"
        destroyOnClose
      >
        <Form
          form={statusForm}
          layout="vertical"
          className="mt-4"
          onFinish={async (values) => {
            if (!statusRecord) return
            try {
              await updateComplaint({
                complaintId: statusRecord.complaintId,
                status: values.status,
                adminNote: values.adminNote.trim(),
              }).unwrap()
              adminActions.notify('Complaint status updated')
              setStatusRecord(null)
            } catch {
              adminActions.notify('Unable to update complaint')
            }
          }}
        >
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Status is required' }]}
          >
            <Select
              className="w-full"
              options={STATUS_OPTIONS}
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            name="adminNote"
            label="Admin Note"
            rules={[{ required: true, message: 'Admin note is required' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="We resolve this issue, thanks a lot for report this issue..."
            />
          </Form.Item>
        </Form>
      </Modal>

      <AdminActionHost actions={adminActions} />
    </>
  )
}
