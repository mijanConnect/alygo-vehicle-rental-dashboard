import { useState } from 'react'
import { Modal, Select, Table, Tag } from 'antd'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useAssignLostItemCaseMutation,
  useCloseLostItemCaseMutation,
  useGetLostItemReportsQuery,
} from '@/services/lostFoundApi'
import type { LostItemReport } from '@/types/lostFound'
import {
  getLostItemReportActionItems,
  REPORT_STATUS_LABELS,
} from '@/features/lost-found/lostFoundHelpers'
import { ReportDetailsDrawer } from '@/features/lost-found/components/ReportDetailsDrawer'

export function LostItemTable() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetLostItemReportsQuery()
  const [selectedReport, setSelectedReport] = useState<LostItemReport | null>(null)
  const [assignRecord, setAssignRecord] = useState<LostItemReport | null>(null)
  const [closeRecord, setCloseRecord] = useState<LostItemReport | null>(null)
  const [assignAdmin, setAssignAdmin] = useState('Admin Ops')

  const [assignCase, { isLoading: assigning }] = useAssignLostItemCaseMutation()
  const [closeCase, { isLoading: closing }] = useCloseLostItemCaseMutation()

  const openDetails = (record: LostItemReport) => setSelectedReport(record)

  const handleAction = (key: string, record: LostItemReport) => {
    switch (key) {
      case 'view':
        openDetails(record)
        break
      case 'assign':
        setAssignRecord(record)
        break
      case 'contact-passenger':
        adminActions.notify(`Contacting passenger: ${record.passengerName}`)
        break
      case 'contact-driver':
        adminActions.notify(`Contacting driver: ${record.driverName}`)
        break
      case 'dispute':
        adminActions.notify(`Dispute opened for report ${record.id}`)
        break
      case 'close':
        setCloseRecord(record)
        break
    }
  }

  return (
    <>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 1300 }}
        {...createTableRowProps<LostItemReport>(openDetails)}
        columns={[
          { title: 'Report ID', dataIndex: 'id', width: 120 },
          { title: 'Passenger', dataIndex: 'passengerName' },
          { title: 'Driver', dataIndex: 'driverName' },
          { title: 'Trip ID', dataIndex: 'tripId', width: 120 },
          { title: 'Item Category', dataIndex: 'itemCategory' },
          { title: 'Item Name', dataIndex: 'itemName', ellipsis: true },
          {
            title: 'Created Date',
            dataIndex: 'createdAt',
            render: (d: string) => new Date(d).toLocaleDateString(),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => <Tag>{REPORT_STATUS_LABELS[s] ?? s.replace(/_/g, ' ')}</Tag>,
          },
          createActionsColumn<LostItemReport>(
            (record) => getLostItemReportActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      <ReportDetailsDrawer
        open={Boolean(selectedReport)}
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

      <Modal
        title={`Assign Case — ${assignRecord?.id}`}
        open={Boolean(assignRecord)}
        confirmLoading={assigning}
        onCancel={() => setAssignRecord(null)}
        onOk={async () => {
          if (!assignRecord) return
          await assignCase({ id: assignRecord.id, assignedAdmin: assignAdmin }).unwrap()
          adminActions.notify(`Case assigned to ${assignAdmin}`)
          setAssignRecord(null)
        }}
        destroyOnClose
      >
        <div className="mt-4 space-y-2">
          <label className="text-sm text-alygo-text-muted">Assigned Admin</label>
          <Select
            className="w-full"
            value={assignAdmin}
            onChange={setAssignAdmin}
            options={[
              { value: 'Admin Ops', label: 'Admin Ops' },
              { value: 'Support Lead', label: 'Support Lead' },
              { value: 'Ops Manager', label: 'Ops Manager' },
            ]}
          />
        </div>
      </Modal>

      <ConfirmationModal
        open={Boolean(closeRecord)}
        title="Close Case"
        description={`Close lost item report ${closeRecord?.id}? This action marks the case as closed.`}
        confirmLabel="Close Case"
        danger
        loading={closing}
        onCancel={() => setCloseRecord(null)}
        onConfirm={async () => {
          if (!closeRecord) return
          await closeCase(closeRecord.id).unwrap()
          adminActions.notify(`Case ${closeRecord.id} closed`)
          setCloseRecord(null)
        }}
      />

      <AdminActionHost actions={adminActions} />
    </>
  )
}
