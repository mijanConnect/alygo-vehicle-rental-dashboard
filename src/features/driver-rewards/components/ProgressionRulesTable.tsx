import { useState } from 'react'
import { Form, InputNumber, Modal, Table, Tag } from 'antd'
import { Pencil } from 'lucide-react'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import type { DetailField } from '@/components/admin/types'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetProgressionRulesQuery,
  useUpdateProgressionRuleMutation,
} from '@/services/driverRewardsApi'
import type { ProgressionRule } from '@/types/driverRewards'
import { levelLabel, openRewardsDrawer } from '@/features/driver-rewards/driverRewardsHelpers'

function buildProgressionFields(record: ProgressionRule): DetailField[] {
  return [
    { label: 'Level', value: levelLabel(record.level) },
    { label: 'Required Points', value: record.requiredPoints },
    { label: 'Required Rating', value: record.requiredRating },
    { label: 'Required Trips', value: record.requiredTrips },
    { label: 'Required Online Hours', value: record.requiredOnlineHours },
    { label: 'Required Acceptance Rate', value: `${record.requiredAcceptanceRate}%` },
    { label: 'Required Completion Rate', value: `${record.requiredCompletionRate}%` },
  ]
}

export function ProgressionRulesTable() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetProgressionRulesQuery()
  const [editRecord, setEditRecord] = useState<ProgressionRule | null>(null)
  const [updateRule, { isLoading: updating }] = useUpdateProgressionRuleMutation()

  return (
    <>
      <p className="mb-4 text-sm text-alygo-text-muted">
        Configure level progression requirements. Changes sync with Driver Level Management.
      </p>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 1200 }}
        {...createTableRowProps<ProgressionRule>((record) =>
          openRewardsDrawer('Progression Rules', buildProgressionFields(record), adminActions),
        )}
        columns={[
          {
            title: 'Tier',
            dataIndex: 'level',
            render: (l: string) => <Tag>{levelLabel(l)}</Tag>,
          },
          { title: 'Required Points', dataIndex: 'requiredPoints' },
          { title: 'Required Rating', dataIndex: 'requiredRating' },
          { title: 'Required Trips', dataIndex: 'requiredTrips' },
          { title: 'Required Online Hours', dataIndex: 'requiredOnlineHours' },
          { title: 'Acceptance Rate', dataIndex: 'requiredAcceptanceRate', render: (v: number) => `${v}%` },
          { title: 'Completion Rate', dataIndex: 'requiredCompletionRate', render: (v: number) => `${v}%` },
          createActionsColumn<ProgressionRule>(
            () => [{ key: 'edit', label: 'Edit', icon: Pencil }],
            (key, record) => {
              if (key === 'edit') setEditRecord(record)
            },
          ),
        ]}
      />

      {editRecord && (
        <Modal
          title={`Edit Progression — ${levelLabel(editRecord.level)}`}
          open
          confirmLoading={updating}
          onCancel={() => setEditRecord(null)}
          onOk={() => {
            document.getElementById('progression-edit-form')?.dispatchEvent(
              new Event('submit', { cancelable: true, bubbles: true }),
            )
          }}
          destroyOnClose
        >
          <Form
            id="progression-edit-form"
            layout="vertical"
            className="mt-4"
            initialValues={editRecord}
            onFinish={async (values) => {
              await updateRule({ id: editRecord.id, ...values }).unwrap()
              adminActions.notify('Progression rules updated')
              setEditRecord(null)
            }}
          >
            <Form.Item name="requiredPoints" label="Required Points" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="requiredRating" label="Required Rating" rules={[{ required: true }]}>
              <InputNumber min={0} max={5} step={0.01} className="w-full" />
            </Form.Item>
            <Form.Item name="requiredTrips" label="Required Trips" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="requiredOnlineHours" label="Required Online Hours" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="requiredAcceptanceRate" label="Required Acceptance Rate (%)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>
            <Form.Item name="requiredCompletionRate" label="Required Completion Rate (%)" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>
            <button type="submit" className="hidden" />
          </Form>
        </Modal>
      )}

      <AdminActionHost actions={adminActions} />
    </>
  )
}
