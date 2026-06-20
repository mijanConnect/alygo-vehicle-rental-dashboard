import { useState } from 'react'
import { Form, Input, Modal, Select, Table } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetNotificationTemplatesQuery,
  useUpdateNotificationTemplateMutation,
} from '@/services/driverRewardsApi'
import type { RewardNotificationTemplate } from '@/types/driverRewards'
import { openRewardsDrawer } from '@/features/driver-rewards/driverRewardsHelpers'
import type { DetailField } from '@/components/admin/types'
import { Eye, Pencil, Power, PowerOff } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import { useDriverRewardsPermissions } from '@/features/driver-rewards/hooks/useDriverRewardsPermissions'

const categoryLabels: Record<string, string> = {
  level_up: 'Level Up',
  points_earned: 'Points Earned',
  bonus_unlocked: 'Bonus Unlocked',
  achievement_earned: 'Achievement Earned',
  promotion_activated: 'Promotion Activated',
}

function buildTemplateFields(record: RewardNotificationTemplate): DetailField[] {
  return [
    { label: 'Notification Name', value: record.name },
    { label: 'Category', value: categoryLabels[record.category] ?? record.category },
    { label: 'Template', value: record.template },
    { label: 'Status', value: record.status === 'active' ? 'Active' : 'Inactive' },
  ]
}

function getNotificationActionItems(record: RewardNotificationTemplate): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'view', label: 'View', icon: Eye },
    { key: 'preview', label: 'Preview Notification', icon: Eye, group: 1 },
    { key: 'edit', label: 'Edit Message', icon: Pencil, group: 2 },
  ]
  if (record.status === 'active') {
    items.push({ key: 'deactivate', label: 'Disable', icon: PowerOff, group: 3 })
  } else {
    items.push({ key: 'activate', label: 'Enable', icon: Power, group: 3 })
  }
  return items
}

function previewMessage(template: string) {
  return template
    .replace('{level}', 'Elite')
    .replace('{points}', '25')
    .replace('{promotionName}', 'Weekend Bonus')
    .replace('{achievement}', '100 Trips Completed')
    .replace('{bonus}', '$50')
}

export function NotificationSettings() {
  const adminActions = useAdminActions()
  const { canManage } = useDriverRewardsPermissions()
  const { data = [], isLoading } = useGetNotificationTemplatesQuery()
  const [editRecord, setEditRecord] = useState<RewardNotificationTemplate | null>(null)
  const [previewRecord, setPreviewRecord] = useState<RewardNotificationTemplate | null>(null)
  const [updateTemplate, { isLoading: updating }] = useUpdateNotificationTemplateMutation()

  const handleAction = (key: string, record: RewardNotificationTemplate) => {
    switch (key) {
      case 'view':
        openRewardsDrawer('Notification Rule', buildTemplateFields(record), adminActions)
        break
      case 'preview':
        setPreviewRecord(record)
        break
      case 'edit':
        if (canManage) setEditRecord(record)
        break
      case 'activate':
        if (canManage) {
          updateTemplate({ id: record.id, status: 'active' }).unwrap()
            .then(() => adminActions.notify('Notification enabled'))
        }
        break
      case 'deactivate':
        if (canManage) {
          updateTemplate({ id: record.id, status: 'inactive' }).unwrap()
            .then(() => adminActions.notify('Notification disabled'))
        }
        break
    }
  }

  return (
    <>
      <p className="mb-4 text-sm text-alygo-text-muted">
        Manage reward notification rules for level changes, points earned, bonuses, achievements, and promotions.
      </p>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 900 }}
        {...createTableRowProps<RewardNotificationTemplate>((record) =>
          openRewardsDrawer('Notification Rule', buildTemplateFields(record), adminActions),
        )}
        columns={[
          { title: 'Notification', dataIndex: 'name' },
          {
            title: 'Category',
            dataIndex: 'category',
            render: (c: string) => categoryLabels[c] ?? c,
          },
          { title: 'Message', dataIndex: 'template', ellipsis: true },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<RewardNotificationTemplate>(
            (record) => getNotificationActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      {editRecord && (
        <Modal
          title={`Edit Message — ${editRecord.name}`}
          open
          confirmLoading={updating}
          onCancel={() => setEditRecord(null)}
          onOk={() => {
            document.getElementById('notification-edit-form')?.dispatchEvent(
              new Event('submit', { cancelable: true, bubbles: true }),
            )
          }}
          destroyOnClose
        >
          <Form
            id="notification-edit-form"
            layout="vertical"
            className="mt-4"
            initialValues={editRecord}
            onFinish={async (values) => {
              await updateTemplate({ id: editRecord.id, ...values }).unwrap()
              adminActions.notify('Notification message updated')
              setEditRecord(null)
            }}
          >
            <Form.Item name="template" label="Message Template" rules={[{ required: true }]}>
              <Input.TextArea rows={3} placeholder="Use {level}, {points}, {promotionName} as placeholders" />
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
            </Form.Item>
            <button type="submit" className="hidden" />
          </Form>
        </Modal>
      )}

      <Modal
        title={`Preview — ${previewRecord?.name}`}
        open={Boolean(previewRecord)}
        onCancel={() => setPreviewRecord(null)}
        footer={null}
      >
        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-alygo-text-muted">Driver notification preview</p>
          <p className="mt-2 text-white">{previewRecord ? previewMessage(previewRecord.template) : ''}</p>
        </div>
      </Modal>

      <AdminActionHost actions={adminActions} />
    </>
  )
}
