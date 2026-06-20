import { useState } from 'react'
import { Form, InputNumber, Modal, Table, Tag } from 'antd'
import { Pencil } from 'lucide-react'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetQualificationRulesQuery,
  useUpdateQualificationRuleMutation,
} from '@/services/driverRewardsApi'
import type { QualificationRule } from '@/types/driverRewards'
import { formatDateTime } from '@/utils/format'

export function QualificationRulesPanel() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetQualificationRulesQuery()
  const [editRecord, setEditRecord] = useState<QualificationRule | null>(null)
  const [updateRule, { isLoading: updating }] = useUpdateQualificationRuleMutation()

  return (
    <>
      <p className="mb-4 text-sm text-alygo-text-muted">
        Configure tier qualification requirements including trips, rating, acceptance, completion, safety, compliance, and total points.
      </p>

      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 1400 }}
        {...createTableRowProps<QualificationRule>(() => {})}
        columns={[
          { title: 'Tier', dataIndex: 'tierLabel', render: (l: string) => <Tag>{l}</Tag> },
          { title: 'Trips', dataIndex: 'requiredTrips' },
          { title: 'Rating', dataIndex: 'requiredRating' },
          { title: 'Acceptance', dataIndex: 'requiredAcceptanceRate', render: (v: number) => `${v}%` },
          { title: 'Completion', dataIndex: 'requiredCompletionRate', render: (v: number) => `${v}%` },
          { title: 'Safety', dataIndex: 'requiredSafetyScore' },
          { title: 'Compliance', dataIndex: 'requiredComplianceScore' },
          { title: 'Points', dataIndex: 'requiredPoints' },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          { title: 'Last Updated', dataIndex: 'lastUpdated', render: (d: string) => formatDateTime(d) },
          createActionsColumn<QualificationRule>(
            () => [{ key: 'edit', label: 'Edit', icon: Pencil }],
            (key, record) => { if (key === 'edit') setEditRecord(record) },
          ),
        ]}
      />

      {editRecord && (
        <Modal
          title={`Edit Qualification — ${editRecord.tierLabel}`}
          open
          confirmLoading={updating}
          onCancel={() => setEditRecord(null)}
          onOk={() => document.getElementById('qual-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
          destroyOnClose
        >
          <Form
            id="qual-form"
            layout="vertical"
            className="mt-4"
            initialValues={editRecord}
            onFinish={async (values) => {
              await updateRule({ id: editRecord.id, ...values }).unwrap()
              adminActions.notify('Qualification rules updated')
              setEditRecord(null)
            }}
          >
            <Form.Item name="requiredTrips" label="Required Trips" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="requiredRating" label="Required Rating" rules={[{ required: true }]}>
              <InputNumber min={0} max={5} step={0.01} className="w-full" />
            </Form.Item>
            <Form.Item name="requiredAcceptanceRate" label="Acceptance Rate (%)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>
            <Form.Item name="requiredCompletionRate" label="Completion Rate (%)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>
            <Form.Item name="requiredSafetyScore" label="Safety Score" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>
            <Form.Item name="requiredComplianceScore" label="Compliance Score" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>
            <Form.Item name="requiredPoints" label="Total Points" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <button type="submit" className="hidden" />
          </Form>
        </Modal>
      )}

      <AdminActionHost actions={adminActions} />
    </>
  )
}
