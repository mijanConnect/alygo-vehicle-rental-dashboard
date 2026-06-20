import { useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Table } from 'antd'
import { Plus } from 'lucide-react'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCreatePointsRuleMutation,
  useDeletePointsRuleMutation,
  useDuplicatePointsRuleMutation,
  useGetPointsRulesQuery,
  useUpdatePointsRuleMutation,
  POINTS_RULE_CATEGORY_LABELS,
} from '@/services/driverRewardsApi'
import type { PointsRule, PointsRuleCategory, PointsRuleType } from '@/types/driverRewards'
import { getPointsRuleActionItems } from '@/features/driver-rewards/driverRewardsHelpers'
import { useDriverRewardsPermissions } from '@/features/driver-rewards/hooks/useDriverRewardsPermissions'
import { formatDateTime } from '@/utils/format'

export function PointsRulesTable() {
  const adminActions = useAdminActions()
  const { canManage } = useDriverRewardsPermissions()
  const { data = [], isLoading } = useGetPointsRulesQuery()
  const [createOpen, setCreateOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<PointsRule | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<PointsRule | null>(null)

  const [createRule, { isLoading: creating }] = useCreatePointsRuleMutation()
  const [updateRule, { isLoading: updating }] = useUpdatePointsRuleMutation()
  const [deleteRule, { isLoading: deleting }] = useDeletePointsRuleMutation()
  const [duplicateRule] = useDuplicatePointsRuleMutation()

  const handleAction = (key: string, record: PointsRule) => {
    if (!canManage) return
    switch (key) {
      case 'edit':
        setEditRecord(record)
        break
      case 'duplicate':
        duplicateRule(record.id).unwrap().then(() => adminActions.notify('Rule duplicated'))
        break
      case 'enable':
        updateRule({ id: record.id, status: 'active' }).unwrap()
          .then(() => adminActions.notify('Rule enabled'))
        break
      case 'disable':
        updateRule({ id: record.id, status: 'inactive' }).unwrap()
          .then(() => adminActions.notify('Rule disabled'))
        break
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  const RuleForm = ({
    id,
    initialValues,
    onFinish,
  }: {
    id: string
    initialValues?: Partial<PointsRule>
    onFinish: (values: Omit<PointsRule, 'id'>) => void
  }) => (
    <Form
      id={id}
      layout="vertical"
      className="mt-4"
      initialValues={{ status: 'active', type: 'earn', category: 'ride_completion', ...initialValues }}
      onFinish={(values) => {
        const type: PointsRuleType = values.points > 0 ? 'earn' : values.points < 0 ? 'deduct' : 'neutral'
        onFinish({
          ...values,
          action: values.ruleName,
          type,
          lastUpdated: new Date().toISOString(),
        })
      }}
    >
      <Form.Item name="ruleName" label="Rule Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="category" label="Category" rules={[{ required: true }]}>
        <Select
          options={Object.entries(POINTS_RULE_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
        />
      </Form.Item>
      <Form.Item name="actionType" label="Action Type" rules={[{ required: true }]}>
        <Input placeholder="e.g. trip_complete" />
      </Form.Item>
      <Form.Item name="points" label="Points" rules={[{ required: true }]}>
        <InputNumber className="w-full" />
      </Form.Item>
      <Form.Item name="status" label="Status" rules={[{ required: true }]}>
        <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
      </Form.Item>
      <button type="submit" className="hidden" />
    </Form>
  )

  return (
    <>
      {canManage && (
        <div className="mb-4 flex justify-end">
          <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Add Rule
          </Button>
        </div>
      )}
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 900 }}
        columns={[
          { title: 'Rule Name', dataIndex: 'ruleName' },
          {
            title: 'Category',
            dataIndex: 'category',
            render: (c: PointsRuleCategory) => POINTS_RULE_CATEGORY_LABELS[c] ?? c,
          },
          {
            title: 'Points',
            dataIndex: 'points',
            render: (p: number) => (
              <span className={p > 0 ? 'text-emerald-400' : p < 0 ? 'text-red-400' : ''}>
                {p > 0 ? `+${p}` : p}
              </span>
            ),
          },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          { title: 'Last Updated', dataIndex: 'lastUpdated', render: (d: string) => formatDateTime(d) },
          ...(canManage
            ? [
                createActionsColumn<PointsRule>(
                  (record) => getPointsRuleActionItems(record),
                  (key, record) => handleAction(key, record),
                ),
              ]
            : []),
        ]}
      />

      <Modal
        title="Add Points Rule"
        open={createOpen}
        confirmLoading={creating}
        onCancel={() => setCreateOpen(false)}
        onOk={() => document.getElementById('points-create-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
        destroyOnClose
      >
        <RuleForm
          id="points-create-form"
          onFinish={async (values) => {
            await createRule(values).unwrap()
            adminActions.notify('Points rule created')
            setCreateOpen(false)
          }}
        />
      </Modal>

      {editRecord && (
        <Modal
          title={`Edit Rule — ${editRecord.ruleName}`}
          open
          confirmLoading={updating}
          onCancel={() => setEditRecord(null)}
          onOk={() => document.getElementById('points-edit-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
          destroyOnClose
        >
          <RuleForm
            id="points-edit-form"
            initialValues={editRecord}
            onFinish={async (values) => {
              await updateRule({ id: editRecord.id, ...values }).unwrap()
              adminActions.notify('Points rule updated')
              setEditRecord(null)
            }}
          />
        </Modal>
      )}

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Points Rule"
        description={`Delete rule "${deleteRecord?.ruleName}"?`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteRecord(null)}
        onConfirm={async () => {
          if (!deleteRecord) return
          await deleteRule(deleteRecord.id).unwrap()
          adminActions.notify('Points rule deleted')
          setDeleteRecord(null)
        }}
      />

      <AdminActionHost actions={adminActions} />
    </>
  )
}
