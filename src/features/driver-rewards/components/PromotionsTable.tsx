import { useState } from 'react'
import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, Table, Tag } from 'antd'
import { Plus } from 'lucide-react'
import dayjs from 'dayjs'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  PROMOTION_TYPE_LABELS,
  useCreatePromotionMutation,
  useDeletePromotionMutation,
  useGetBonusRulesQuery,
  useGetPromotionsQuery,
  useUpdatePromotionMutation,
} from '@/services/driverRewardsApi'
import type { Promotion, PromotionType } from '@/types/driverRewards'
import {
  buildPromotionDetailFields,
  getPromotionActionItems,
  openRewardsDrawer,
} from '@/features/driver-rewards/driverRewardsHelpers'
import { formatCurrency } from '@/utils/format'
import { useDriverRewardsPermissions } from '@/features/driver-rewards/hooks/useDriverRewardsPermissions'

const promotionTypeOptions = Object.entries(PROMOTION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const statusColors: Record<string, string> = {
  active: 'success',
  paused: 'warning',
  scheduled: 'processing',
  ended: 'default',
}

function PromotionForm({
  id,
  initialValues,
  onFinish,
}: {
  id: string
  initialValues?: Partial<Promotion>
  onFinish: (values: Omit<Promotion, 'id'>) => void
}) {
  return (
    <Form
      id={id}
      layout="vertical"
      className="mt-4"
      initialValues={
        initialValues
          ? {
              ...initialValues,
              startDate: dayjs(initialValues.startDate),
              endDate: dayjs(initialValues.endDate),
            }
          : { status: 'scheduled' }
      }
      onFinish={(values) => {
        onFinish({
          ...values,
          startDate: values.startDate.toISOString(),
          endDate: values.endDate.toISOString(),
        })
      }}
    >
      <Form.Item name="name" label="Promotion Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="type" label="Type" rules={[{ required: true }]}>
        <Select options={promotionTypeOptions} />
      </Form.Item>
      <Form.Item name="amount" label="Bonus Amount" rules={[{ required: true }]}>
        <InputNumber min={0} prefix="$" className="w-full" />
      </Form.Item>
      <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
        <DatePicker showTime className="w-full" />
      </Form.Item>
      <Form.Item name="endDate" label="End Date" rules={[{ required: true }]}>
        <DatePicker showTime className="w-full" />
      </Form.Item>
      <Form.Item name="status" label="Status" rules={[{ required: true }]}>
        <Select
          options={[
            { value: 'active', label: 'Active' },
            { value: 'paused', label: 'Paused' },
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'ended', label: 'Ended' },
          ]}
        />
      </Form.Item>
      <button type="submit" className="hidden" />
    </Form>
  )
}

export function PromotionsTable() {
  const adminActions = useAdminActions()
  const { canManagePromotions } = useDriverRewardsPermissions()
  const { data = [], isLoading } = useGetPromotionsQuery()
  const { data: bonusRules = [], isLoading: loadingBonus } = useGetBonusRulesQuery()
  const [createOpen, setCreateOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<Promotion | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<Promotion | null>(null)

  const [createPromotion, { isLoading: creating }] = useCreatePromotionMutation()
  const [updatePromotion, { isLoading: updating }] = useUpdatePromotionMutation()
  const [deletePromotion, { isLoading: deleting }] = useDeletePromotionMutation()

  const handleAction = (key: string, record: Promotion) => {
    if (!canManagePromotions) return
    switch (key) {
      case 'edit':
        setEditRecord(record)
        break
      case 'pause':
        updatePromotion({ id: record.id, status: 'paused' }).unwrap()
          .then(() => adminActions.notify('Promotion paused'))
        break
      case 'activate':
        updatePromotion({ id: record.id, status: 'active' }).unwrap()
          .then(() => adminActions.notify('Promotion activated'))
        break
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        {canManagePromotions && (
          <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            Create Promotion
          </Button>
        )}
      </div>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 1100 }}
        {...createTableRowProps<Promotion>((record) =>
          openRewardsDrawer('Promotion', buildPromotionDetailFields(record), adminActions),
        )}
        columns={[
          { title: 'Promotion Name', dataIndex: 'name' },
          {
            title: 'Type',
            dataIndex: 'type',
            render: (t: PromotionType) => PROMOTION_TYPE_LABELS[t] ?? t,
          },
          { title: 'Bonus Amount', dataIndex: 'amount', render: (a: number) => formatCurrency(a) },
          {
            title: 'Start Date',
            dataIndex: 'startDate',
            render: (d: string) => new Date(d).toLocaleDateString(),
          },
          {
            title: 'End Date',
            dataIndex: 'endDate',
            render: (d: string) => new Date(d).toLocaleDateString(),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag>,
          },
          ...(canManagePromotions
            ? [
                createActionsColumn<Promotion>(
                  (record) => getPromotionActionItems(record),
                  (key, record) => handleAction(key, record),
                ),
              ]
            : []),
        ]}
      />

      <div className="mt-8 mb-4">
        <h3 className="text-base font-semibold text-white">Bonus Rules</h3>
        <p className="text-xs text-alygo-text-muted">Configured bonus rules applied to driver rewards</p>
      </div>
      <Table
        loading={loadingBonus}
        rowKey="id"
        dataSource={bonusRules}
        scroll={{ x: 900 }}
        columns={[
          { title: 'Rule Name', dataIndex: 'name' },
          {
            title: 'Type',
            dataIndex: 'type',
            render: (t: string) => PROMOTION_TYPE_LABELS[t as PromotionType] ?? t,
          },
          { title: 'Bonus Amount', dataIndex: 'amount', render: (a: number) => formatCurrency(a) },
          { title: 'Description', dataIndex: 'description', ellipsis: true },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => <Tag color={s === 'active' ? 'success' : 'default'}>{s}</Tag>,
          },
        ]}
      />

      <Modal
        title="Create Promotion"
        open={createOpen}
        confirmLoading={creating}
        onCancel={() => setCreateOpen(false)}
        onOk={() => {
          document.getElementById('promo-create-form')?.dispatchEvent(
            new Event('submit', { cancelable: true, bubbles: true }),
          )
        }}
        destroyOnClose
      >
        <PromotionForm
          id="promo-create-form"
          onFinish={async (values) => {
            await createPromotion(values).unwrap()
            adminActions.notify('Promotion created')
            setCreateOpen(false)
          }}
        />
      </Modal>

      {editRecord && (
        <Modal
          title={`Edit Promotion — ${editRecord.name}`}
          open
          confirmLoading={updating}
          onCancel={() => setEditRecord(null)}
          onOk={() => {
            document.getElementById('promo-edit-form')?.dispatchEvent(
              new Event('submit', { cancelable: true, bubbles: true }),
            )
          }}
          destroyOnClose
        >
          <PromotionForm
            id="promo-edit-form"
            initialValues={editRecord}
            onFinish={async (values) => {
              await updatePromotion({ id: editRecord.id, ...values }).unwrap()
              adminActions.notify('Promotion updated')
              setEditRecord(null)
            }}
          />
        </Modal>
      )}

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Promotion"
        description={`Delete promotion "${deleteRecord?.name}"?`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteRecord(null)}
        onConfirm={async () => {
          if (!deleteRecord) return
          await deletePromotion(deleteRecord.id).unwrap()
          adminActions.notify('Promotion deleted')
          setDeleteRecord(null)
        }}
      />

      <AdminActionHost actions={adminActions} />
    </>
  )
}
