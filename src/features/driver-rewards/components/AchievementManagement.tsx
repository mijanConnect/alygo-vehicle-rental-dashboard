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
  useCreateAchievementMutation,
  useDeleteAchievementMutation,
  useGetAchievementsQuery,
  useUpdateAchievementMutation,
} from '@/services/driverRewardsApi'
import type { Achievement } from '@/types/driverRewards'
import { getAchievementActionItems } from '@/features/driver-rewards/driverRewardsHelpers'

function AchievementForm({
  id,
  initialValues,
  onFinish,
}: {
  id: string
  initialValues?: Partial<Achievement>
  onFinish: (values: Omit<Achievement, 'id'>) => void
}) {
  return (
    <Form
      id={id}
      layout="vertical"
      className="mt-4"
      initialValues={{ status: 'active', ...initialValues }}
      onFinish={onFinish}
    >
      <Form.Item name="name" label="Achievement" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="reward" label="Reward" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="pointsAwarded" label="Points Awarded" rules={[{ required: true }]}>
        <InputNumber min={0} className="w-full" />
      </Form.Item>
      <Form.Item name="criteria" label="Unlock Criteria" rules={[{ required: true }]}>
        <Input placeholder="e.g. Complete 100 trips" />
      </Form.Item>
      <Form.Item name="icon" label="Icon" initialValue="award">
        <Input placeholder="e.g. star, crown, shield" />
      </Form.Item>
      <Form.Item name="status" label="Status" rules={[{ required: true }]}>
        <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
      </Form.Item>
      <button type="submit" className="hidden" />
    </Form>
  )
}

export function AchievementManagement() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetAchievementsQuery()
  const [createOpen, setCreateOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<Achievement | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<Achievement | null>(null)

  const [createAchievement, { isLoading: creating }] = useCreateAchievementMutation()
  const [updateAchievement, { isLoading: updating }] = useUpdateAchievementMutation()
  const [deleteAchievement, { isLoading: deleting }] = useDeleteAchievementMutation()

  const handleAction = (key: string, record: Achievement) => {
    switch (key) {
      case 'edit':
        setEditRecord(record)
        break
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
          Add Achievement
        </Button>
      </div>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 800 }}
        columns={[
          { title: 'Achievement', dataIndex: 'name' },
          { title: 'Criteria', dataIndex: 'criteria', ellipsis: true },
          { title: 'Reward', dataIndex: 'reward' },
          { title: 'Points Awarded', dataIndex: 'pointsAwarded' },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<Achievement>(
            () => getAchievementActionItems(),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      <Modal
        title="Add Achievement"
        open={createOpen}
        confirmLoading={creating}
        onCancel={() => setCreateOpen(false)}
        onOk={() => {
          document.getElementById('ach-create-form')?.dispatchEvent(
            new Event('submit', { cancelable: true, bubbles: true }),
          )
        }}
        destroyOnClose
      >
        <AchievementForm
          id="ach-create-form"
          onFinish={async (values) => {
            await createAchievement(values).unwrap()
            adminActions.notify('Achievement created')
            setCreateOpen(false)
          }}
        />
      </Modal>

      {editRecord && (
        <Modal
          title={`Edit Achievement — ${editRecord.name}`}
          open
          confirmLoading={updating}
          onCancel={() => setEditRecord(null)}
          onOk={() => {
            document.getElementById('ach-edit-form')?.dispatchEvent(
              new Event('submit', { cancelable: true, bubbles: true }),
            )
          }}
          destroyOnClose
        >
          <AchievementForm
            id="ach-edit-form"
            initialValues={editRecord}
            onFinish={async (values) => {
              await updateAchievement({ id: editRecord.id, ...values }).unwrap()
              adminActions.notify('Achievement updated')
              setEditRecord(null)
            }}
          />
        </Modal>
      )}

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Achievement"
        description={`Delete achievement "${deleteRecord?.name}"?`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteRecord(null)}
        onConfirm={async () => {
          if (!deleteRecord) return
          await deleteAchievement(deleteRecord.id).unwrap()
          adminActions.notify('Achievement deleted')
          setDeleteRecord(null)
        }}
      />

      <AdminActionHost actions={adminActions} />
    </>
  )
}
