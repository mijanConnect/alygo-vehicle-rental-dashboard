import { useMemo, useState } from 'react'
import { Form, Input, InputNumber, Modal, Table, Tag } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useAddDriverWarningMutation,
  useAdjustFareMutation,
  useApproveRefundMutation,
  useGetTripComplaintsQuery,
  usePartialRefundMutation,
  useRejectComplaintMutation,
  useSuspendDriverFromComplaintMutation,
} from '@/services/tripCompletionReviewApi'
import type { TripCompletionComplaint } from '@/types/tripCompletionReview'
import {
  COMPLAINT_STATUS_LABELS,
  getComplaintActionItems,
} from '@/features/trip-completion-review/tripCompletionReviewHelpers'
import { ComplaintReviewDrawer } from '@/features/trip-completion-review/components/ComplaintReviewDrawer'
import { formatCurrency } from '@/utils/format'

interface ComplaintQueueTableProps {
  filter?: (complaint: TripCompletionComplaint) => boolean
  description?: string
}

export function ComplaintQueueTable({ filter, description }: ComplaintQueueTableProps = {}) {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetTripComplaintsQuery()
  const filteredData = useMemo(
    () => (filter ? data.filter(filter) : data),
    [data, filter],
  )
  const [selected, setSelected] = useState<TripCompletionComplaint | null>(null)
  const [partialRecord, setPartialRecord] = useState<TripCompletionComplaint | null>(null)
  const [adjustRecord, setAdjustRecord] = useState<TripCompletionComplaint | null>(null)
  const [partialAmount, setPartialAmount] = useState(0)
  const [newFare, setNewFare] = useState(0)

  const [approveRefund] = useApproveRefundMutation()
  const [partialRefund, { isLoading: partialLoading }] = usePartialRefundMutation()
  const [rejectComplaint] = useRejectComplaintMutation()
  const [adjustFare, { isLoading: adjustLoading }] = useAdjustFareMutation()
  const [addWarning] = useAddDriverWarningMutation()
  const [suspendDriver] = useSuspendDriverFromComplaintMutation()

  const openDetails = (record: TripCompletionComplaint) => setSelected(record)

  const handleAction = (key: string, record: TripCompletionComplaint) => {
    switch (key) {
      case 'view':
        openDetails(record)
        break
      case 'approve-refund':
        approveRefund({ id: record.id }).unwrap()
          .then(() => adminActions.notify('Full refund approved'))
        break
      case 'partial-refund':
        setPartialRecord(record)
        setPartialAmount(record.fareTotal * 0.5)
        break
      case 'reject':
        rejectComplaint({ id: record.id }).unwrap()
          .then(() => adminActions.notify('Complaint rejected'))
        break
      case 'adjust-fare':
        setAdjustRecord(record)
        setNewFare(record.fareTotal)
        break
      case 'driver-warning':
        addWarning(record.id).unwrap()
          .then(() => adminActions.notify(`Warning added for ${record.driverName}`))
        break
      case 'suspend-driver':
        adminActions.openConfirm({
          title: 'Suspend Driver',
          description: `Suspend ${record.driverName} due to trip completion complaint?`,
          confirmLabel: 'Suspend Driver',
          danger: true,
          onConfirm: async () => {
            await suspendDriver(record.id).unwrap()
            adminActions.notify(`${record.driverName} suspended`)
          },
        })
        break
    }
  }

  return (
    <>
      {description && (
        <p className="mb-4 text-sm text-alygo-text-muted">{description}</p>
      )}
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={filteredData}
        scroll={{ x: 1400 }}
        {...createTableRowProps<TripCompletionComplaint>(openDetails)}
        columns={[
          { title: 'Complaint ID', dataIndex: 'id', width: 110 },
          { title: 'Trip ID', dataIndex: 'tripId', width: 110 },
          { title: 'Passenger', dataIndex: 'passengerName' },
          { title: 'Driver', dataIndex: 'driverName' },
          { title: 'Type', dataIndex: 'complaintType' },
          {
            title: 'Distance Delta',
            dataIndex: 'distanceDeltaMeters',
            render: (m: number) => `${m}m`,
          },
          { title: 'Fare', dataIndex: 'fareTotal', render: (f: number) => formatCurrency(f) },
          {
            title: 'Reported',
            dataIndex: 'reportedAt',
            render: (d: string) => new Date(d).toLocaleDateString(),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => <Tag>{COMPLAINT_STATUS_LABELS[s] ?? s}</Tag>,
          },
          createActionsColumn<TripCompletionComplaint>(
            (record) => getComplaintActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      <ComplaintReviewDrawer
        open={Boolean(selected)}
        complaint={selected}
        onClose={() => setSelected(null)}
      />

      <Modal
        title={`Partial Refund — ${partialRecord?.id}`}
        open={Boolean(partialRecord)}
        confirmLoading={partialLoading}
        onCancel={() => setPartialRecord(null)}
        onOk={async () => {
          if (!partialRecord) return
          await partialRefund({ id: partialRecord.id, amount: partialAmount }).unwrap()
          adminActions.notify('Partial refund issued')
          setPartialRecord(null)
        }}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Refund Amount">
            <InputNumber
              min={0}
              max={partialRecord?.fareTotal}
              prefix="$"
              className="w-full"
              value={partialAmount}
              onChange={(v) => setPartialAmount(v ?? 0)}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Adjust Fare — ${adjustRecord?.id}`}
        open={Boolean(adjustRecord)}
        confirmLoading={adjustLoading}
        onCancel={() => setAdjustRecord(null)}
        onOk={async () => {
          if (!adjustRecord) return
          await adjustFare({ id: adjustRecord.id, newTotal: newFare }).unwrap()
          adminActions.notify('Fare adjusted')
          setAdjustRecord(null)
        }}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="New Fare Total">
            <InputNumber
              min={0}
              prefix="$"
              className="w-full"
              value={newFare}
              onChange={(v) => setNewFare(v ?? 0)}
            />
          </Form.Item>
          <Form.Item label="Notes">
            <Input placeholder="Adjustment reason" />
          </Form.Item>
        </Form>
      </Modal>

      <AdminActionHost actions={adminActions} />
    </>
  )
}
