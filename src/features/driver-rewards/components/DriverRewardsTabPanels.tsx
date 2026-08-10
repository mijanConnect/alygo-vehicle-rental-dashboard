import { useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Table } from 'antd'
import { Plus } from 'lucide-react'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { getRewardsConfigActionItems } from '@/features/driver-rewards/driverRewardsConfigHelpers'
import {
  buildPointRuleWritePayload,
  defaultPointRuleFormValues,
  formatPointRulePoints,
  mapPointRuleItem,
  POINT_RULE_EVENT_TYPE_LABELS,
  POINT_RULE_EVENT_TYPE_OPTIONS,
  pointRuleToFormValues,
  type PointRuleFormValues,
  type PointRuleRow,
} from '@/features/driver-rewards/mapPointRules'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCreatePointRuleMutation,
  useDeletePointRuleMutation,
  useGetPointRulesListQuery,
  useUpdatePointRuleMutation,
} from '@/redux/api/driverRewardManagementApi'
import type { PointRuleActionType } from '@/redux/api/driverRewardManagementApi'
import { formatDateTime } from '@/utils/format'

const PAGE_SIZE = 10

const REWARDS_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

function ConfigTableHeader({
  search,
  onSearchChange,
  status,
  onStatusChange,
  searchPlaceholder,
  addLabel,
  onAdd,
}: {
  search: string
  onSearchChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  searchPlaceholder: string
  addLabel: string
  onAdd: () => void
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <SearchingInput
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
        <Select
          placeholder="Filter by status"
          value={status || undefined}
          onChange={onStatusChange}
          allowClear
          options={REWARDS_STATUS_OPTIONS}
          className="!min-w-[180px]"
        />
      </div>
      <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={onAdd}>
        {addLabel}
      </Button>
    </div>
  )
}

function PointRulesTabPanel({
  actionType,
  searchPlaceholder,
  addLabel,
  pointsLabel,
  pointsClassName,
}: {
  actionType: PointRuleActionType
  searchPlaceholder: string
  addLabel: string
  pointsLabel: string
  pointsClassName: string
}) {
  const adminActions = useAdminActions()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<PointRuleRow | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<PointRuleRow | null>(null)
  const [form] = Form.useForm<PointRuleFormValues>()

  const { data, isLoading, isFetching } = useGetPointRulesListQuery({
    page,
    limit,
    searchTerm,
    status: status || undefined,
    actionType,
  })

  const rows = useMemo(() => (data?.data ?? []).map(mapPointRuleItem), [data?.data])
  const meta = data?.meta

  const [createRule, { isLoading: creating }] = useCreatePointRuleMutation()
  const [updateRule, { isLoading: updating }] = useUpdatePointRuleMutation()
  const [deleteRule, { isLoading: deleting }] = useDeletePointRuleMutation()

  const openCreate = () => {
    setEditRecord(null)
    form.resetFields()
    form.setFieldsValue(defaultPointRuleFormValues(actionType))
    setModalOpen(true)
  }

  const openEdit = (record: PointRuleRow) => {
    setEditRecord(record)
    form.setFieldsValue(pointRuleToFormValues(record))
    setModalOpen(true)
  }

  const handleAction = async (key: string, record: PointRuleRow) => {
    switch (key) {
      case 'edit':
        openEdit(record)
        break
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    const payload = buildPointRuleWritePayload(values, actionType)

    try {
      if (editRecord) {
        await updateRule({ id: editRecord.id, body: payload }).unwrap()
        adminActions.notify('Rule updated', values.name)
      } else {
        await createRule(payload).unwrap()
        adminActions.notify('Rule created', values.name)
      }
      setModalOpen(false)
    } catch (err) {
      adminActions.notify('Unable to save rule', String(err))
    }
  }

  return (
    <>
      <ConfigTableHeader
        search={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value)
          setPage(1)
        }}
        status={status}
        onStatusChange={(value) => {
          setStatus(value ?? '')
          setPage(1)
        }}
        searchPlaceholder={searchPlaceholder}
        addLabel={addLabel}
        onAdd={openCreate}
      />
      <Table
        loading={isLoading || isFetching || creating || updating}
        rowKey="id"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 900 }}
        columns={[
          { title: 'Rule Name', dataIndex: 'name' },
          {
            title: 'Event Type',
            dataIndex: 'eventType',
            render: (eventType: PointRuleRow['eventType']) =>
              POINT_RULE_EVENT_TYPE_LABELS[eventType] ?? eventType,
          },
          {
            title: pointsLabel,
            dataIndex: 'points',
            render: (points: number) => (
              <span className={pointsClassName}>
                {formatPointRulePoints(points, actionType)}
              </span>
            ),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => <StatusBadge status={s} />,
          },
          {
            title: 'Created At',
            dataIndex: 'createdAt',
            render: (d: string) => (d ? formatDateTime(d) : '—'),
          },
          createActionsColumn<PointRuleRow>(
            (record) =>
              getRewardsConfigActionItems(record.status === 'active' ? 'active' : 'inactive').filter(
                (item) => item.key !== 'enable' && item.key !== 'disable',
              ),
            (key, record) => void handleAction(key, record),
          ),
        ]}
      />
      <Pagination
        currentPage={meta?.page ?? page}
        totalPages={Math.max(meta?.totalPages ?? 1, 1)}
        totalItems={meta?.totalItems ?? 0}
        itemsPerPage={meta?.limit ?? limit}
        onPageChange={setPage}
        onItemsPerPageChange={(size) => {
          setLimit(size)
          setPage(1)
        }}
      />
      <Modal
        title={editRecord ? 'Edit Rule' : addLabel}
        open={modalOpen}
        confirmLoading={creating || updating}
        okText="Save"
        cancelText="Cancel"
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Rule Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Ride Completed Bonus" />
          </Form.Item>
          <Form.Item name="eventType" label="Event Type" rules={[{ required: true }]}>
            <Select options={POINT_RULE_EVENT_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item
            name="points"
            label={pointsLabel}
            rules={[{ required: true, message: 'Points value is required' }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Rule"
        description={`Delete "${deleteRecord?.name}"?`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteRecord(null)}
        onConfirm={async () => {
          if (!deleteRecord) return
          try {
            await deleteRule({ id: deleteRecord.id, actionType }).unwrap()
            adminActions.notify('Rule deleted', deleteRecord.name)
            setDeleteRecord(null)
          } catch (err) {
            adminActions.notify('Unable to delete rule', String(err))
          }
        }}
      />
      <AdminActionHost actions={adminActions} />
    </>
  )
}

export function RewardRulesTab() {
  return (
    <PointRulesTabPanel
      actionType="earning"
      searchPlaceholder="Search reward rules..."
      addLabel="Add Reward Rule"
      pointsLabel="Points Awarded"
      pointsClassName="text-emerald-400"
    />
  )
}

export function PenaltyRulesTab() {
  return (
    <PointRulesTabPanel
      actionType="deduction"
      searchPlaceholder="Search penalty rules..."
      addLabel="Add Penalty Rule"
      pointsLabel="Deduction Points"
      pointsClassName="text-red-400"
    />
  )
}
