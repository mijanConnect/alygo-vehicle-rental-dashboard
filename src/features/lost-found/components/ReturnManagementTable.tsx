import { useState } from 'react'
import { Form, Modal, Select, Table, Tag } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCompleteReturnMutation,
  useGetLostItemReportsQuery,
  useGetReturnRecordsQuery,
  useUpdateReturnStatusMutation,
} from '@/services/lostFoundApi'
import type { ReturnRecord, ReturnStatus } from '@/types/lostFound'
import { formatCurrency } from '@/utils/format'
import {
  getReturnActionItems,
  RETURN_METHOD_LABELS,
  RETURN_STATUS_LABELS,
} from '@/features/lost-found/lostFoundHelpers'
import { ReportDetailsDrawer } from '@/features/lost-found/components/ReportDetailsDrawer'

export function ReturnManagementTable() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetReturnRecordsQuery()
  const { data: reports = [] } = useGetLostItemReportsQuery()
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [statusRecord, setStatusRecord] = useState<ReturnRecord | null>(null)

  const [updateStatus, { isLoading: updating }] = useUpdateReturnStatusMutation()
  const [completeReturn] = useCompleteReturnMutation()

  const selectedReport = reports.find((r) => r.id === selectedReportId) ?? null

  const handleAction = (key: string, record: ReturnRecord) => {
    switch (key) {
      case 'view':
        setSelectedReportId(record.reportId)
        break
      case 'update-status':
        setStatusRecord(record)
        break
      case 'complete':
        completeReturn(record.id).unwrap().then(() => {
          adminActions.notify(`Return ${record.id} completed`)
        })
        break
    }
  }

  return (
    <>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 1100 }}
        {...createTableRowProps<ReturnRecord>((record) => setSelectedReportId(record.reportId))}
        columns={[
          { title: 'Report ID', dataIndex: 'reportId', width: 120 },
          {
            title: 'Return Method',
            dataIndex: 'returnMethod',
            render: (m: string) => RETURN_METHOD_LABELS[m] ?? m,
          },
          { title: 'Passenger', dataIndex: 'passengerName' },
          { title: 'Driver', dataIndex: 'driverName' },
          {
            title: 'Scheduled Date',
            dataIndex: 'scheduledDate',
            render: (d: string) => new Date(d).toLocaleString(),
          },
          {
            title: 'Return Status',
            dataIndex: 'returnStatus',
            render: (s: string) => <Tag>{RETURN_STATUS_LABELS[s] ?? s}</Tag>,
          },
          { title: 'Fee', dataIndex: 'fee', render: (f: number) => formatCurrency(f) },
          createActionsColumn<ReturnRecord>(
            (record) => getReturnActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      <ReportDetailsDrawer
        open={Boolean(selectedReport)}
        report={selectedReport}
        onClose={() => setSelectedReportId(null)}
      />

      {statusRecord && (
        <Modal
          title={`Update Status — ${statusRecord.id}`}
          open
          confirmLoading={updating}
          onCancel={() => setStatusRecord(null)}
          onOk={() => {
            document.getElementById('return-status-form')?.dispatchEvent(
              new Event('submit', { cancelable: true, bubbles: true }),
            )
          }}
          destroyOnClose
        >
          <Form
            id="return-status-form"
            layout="vertical"
            className="mt-4"
            initialValues={{ returnStatus: statusRecord.returnStatus }}
            onFinish={async (values: { returnStatus: ReturnStatus }) => {
              await updateStatus({ id: statusRecord.id, returnStatus: values.returnStatus }).unwrap()
              adminActions.notify('Return status updated')
              setStatusRecord(null)
            }}
          >
            <Form.Item name="returnStatus" label="Return Status" rules={[{ required: true }]}>
              <Select
                options={Object.entries(RETURN_STATUS_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </Form.Item>
            <button type="submit" className="hidden" />
          </Form>
        </Modal>
      )}

      <AdminActionHost actions={adminActions} />
    </>
  )
}
