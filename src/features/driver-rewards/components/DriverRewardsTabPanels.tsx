import { useState } from 'react'
import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, Table } from 'antd'
import dayjs from 'dayjs'
import { Plus } from 'lucide-react'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TableFilters } from '@/components/common/TableFilters'
import {
  getRewardsConfigActionItems,
  REWARD_CATEGORY_LABELS,
  REWARD_CATEGORY_OPTIONS,
  REWARDS_STATUS_OPTIONS,
} from '@/features/driver-rewards/driverRewardsConfigHelpers'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCreateBonusCampaignMutation,
  useCreatePenaltyRuleMutation,
  useCreatePointsRuleMutation,
  useDeleteBonusCampaignMutation,
  useDeletePenaltyRuleMutation,
  useDeletePointsRuleMutation,
  useGetBonusProgramsListQuery,
  useGetPenaltyRulesListQuery,
  useGetRewardRulesListQuery,
  useUpdateBonusCampaignMutation,
  useUpdatePenaltyRuleMutation,
  useUpdatePointsRuleMutation,
} from '@/services/driverRewardsApi'
import type { BonusCampaign, PenaltyRule, PointsRule } from '@/types/driverRewards'
import { formatDate } from '@/utils/format'

const PAGE_SIZE = 10

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

function bonusProgramStatus(record: BonusCampaign): 'active' | 'inactive' {
  return record.enabled && record.status === 'active' ? 'active' : 'inactive'
}

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
      <TableFilters
        variant="inline"
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        statusOptions={REWARDS_STATUS_OPTIONS}
        status={status}
        onStatusChange={onStatusChange}
      />
      <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={onAdd}>
        {addLabel}
      </Button>
    </div>
  )
}

export function RewardRulesTab() {
  const adminActions = useAdminActions()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<PointsRule | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<PointsRule | null>(null)
  const [form] = Form.useForm<{
    actionName: string
    category: PointsRule['category']
    points: number
    description: string
    status: PointsRule['status']
  }>()

  const { data, isLoading } = useGetRewardRulesListQuery({ page, pageSize: PAGE_SIZE, search, status })
  const [createRule, { isLoading: creating }] = useCreatePointsRuleMutation()
  const [updateRule, { isLoading: updating }] = useUpdatePointsRuleMutation()
  const [deleteRule, { isLoading: deleting }] = useDeletePointsRuleMutation()

  const openCreate = () => {
    setEditRecord(null)
    form.resetFields()
    form.setFieldsValue({ status: 'active', points: 5, category: 'ride_completion', description: '' })
    setModalOpen(true)
  }

  const openEdit = (record: PointsRule) => {
    setEditRecord(record)
    form.setFieldsValue({
      actionName: record.ruleName,
      category: record.category,
      points: record.points,
      description: record.description ?? '',
      status: record.status,
    })
    setModalOpen(true)
  }

  const handleAction = async (key: string, record: PointsRule) => {
    switch (key) {
      case 'edit':
        openEdit(record)
        break
      case 'delete':
        setDeleteRecord(record)
        break
      case 'enable':
        await updateRule({ id: record.id, status: 'active' }).unwrap()
        adminActions.notify('Reward rule enabled', record.ruleName)
        break
      case 'disable':
        await updateRule({ id: record.id, status: 'inactive' }).unwrap()
        adminActions.notify('Reward rule disabled', record.ruleName)
        break
    }
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    const actionName = values.actionName.trim()
    const payload: Omit<PointsRule, 'id'> = {
      ruleName: actionName,
      action: actionName,
      actionType: slugify(actionName),
      category: values.category,
      points: values.points,
      description: values.description?.trim() || undefined,
      type: values.points > 0 ? 'earn' : values.points < 0 ? 'deduct' : 'neutral',
      status: values.status,
      lastUpdated: new Date().toISOString(),
    }
    if (editRecord) {
      await updateRule({ id: editRecord.id, ...payload }).unwrap()
      adminActions.notify('Reward rule updated', actionName)
    } else {
      await createRule(payload).unwrap()
      adminActions.notify('Reward rule created', actionName)
    }
    setModalOpen(false)
  }

  return (
    <>
      <ConfigTableHeader
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        status={status}
        onStatusChange={(v) => {
          setStatus(v ?? '')
          setPage(1)
        }}
        searchPlaceholder="Search reward rules..."
        addLabel="Add Reward Rule"
        onAdd={openCreate}
      />
      <Table
        loading={isLoading || creating || updating}
        rowKey="id"
        dataSource={data?.data ?? []}
        scroll={{ x: 900 }}
        pagination={{
          current: page,
          total: data?.total ?? 0,
          pageSize: PAGE_SIZE,
          onChange: setPage,
          showSizeChanger: false,
        }}
        columns={[
          { title: 'Action Name', dataIndex: 'ruleName' },
          {
            title: 'Category',
            dataIndex: 'category',
            render: (c: PointsRule['category']) => REWARD_CATEGORY_LABELS[c] ?? c,
          },
          {
            title: 'Points Awarded',
            dataIndex: 'points',
            render: (p: number) => <span className="text-emerald-400">+{p}</span>,
          },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<PointsRule>(
            (record) => getRewardsConfigActionItems(record.status),
            (key, record) => void handleAction(key, record),
          ),
        ]}
      />
      <Modal
        title={editRecord ? 'Edit Reward Rule' : 'Add Reward Rule'}
        open={modalOpen}
        confirmLoading={creating || updating}
        okText="Save"
        cancelText="Cancel"
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="actionName" label="Action Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Standard Ride Completion" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select options={REWARD_CATEGORY_OPTIONS} />
          </Form.Item>
          <Form.Item name="points" label="Points Awarded" rules={[{ required: true }]}>
            <InputNumber min={1} className="w-full" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Optional rule description" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={REWARDS_STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Reward Rule"
        description={`Delete "${deleteRecord?.ruleName}"?`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteRecord(null)}
        onConfirm={async () => {
          if (!deleteRecord) return
          await deleteRule(deleteRecord.id).unwrap()
          adminActions.notify('Reward rule deleted', deleteRecord.ruleName)
          setDeleteRecord(null)
        }}
      />
      <AdminActionHost actions={adminActions} />
    </>
  )
}

export function BonusProgramsTab() {
  const adminActions = useAdminActions()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<BonusCampaign | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<BonusCampaign | null>(null)
  const [form] = Form.useForm<{
    programName: string
    description: string
    requirement: string
    rewardPoints: number
    startDate: dayjs.Dayjs
    endDate: dayjs.Dayjs
    status: 'active' | 'inactive'
  }>()

  const { data, isLoading } = useGetBonusProgramsListQuery({ page, pageSize: PAGE_SIZE, search, status })
  const [createProgram, { isLoading: creating }] = useCreateBonusCampaignMutation()
  const [updateProgram, { isLoading: updating }] = useUpdateBonusCampaignMutation()
  const [deleteProgram, { isLoading: deleting }] = useDeleteBonusCampaignMutation()

  const openCreate = () => {
    setEditRecord(null)
    form.resetFields()
    const start = dayjs()
    form.setFieldsValue({
      status: 'active',
      rewardPoints: 100,
      startDate: start,
      endDate: start.add(30, 'day'),
    })
    setModalOpen(true)
  }

  const openEdit = (record: BonusCampaign) => {
    setEditRecord(record)
    form.setFieldsValue({
      programName: record.name,
      description: record.description,
      requirement: record.requirement,
      rewardPoints: record.rewardPoints,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
      status: bonusProgramStatus(record),
    })
    setModalOpen(true)
  }

  const handleAction = async (key: string, record: BonusCampaign) => {
    switch (key) {
      case 'edit':
        openEdit(record)
        break
      case 'delete':
        setDeleteRecord(record)
        break
      case 'enable':
        await updateProgram({ id: record.id, enabled: true, status: 'active' }).unwrap()
        adminActions.notify('Bonus program enabled', record.name)
        break
      case 'disable':
        await updateProgram({ id: record.id, enabled: false, status: 'paused' }).unwrap()
        adminActions.notify('Bonus program disabled', record.name)
        break
    }
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    const enabled = values.status === 'active'
    const base = {
      name: values.programName.trim(),
      description: values.description.trim(),
      requirement: values.requirement.trim(),
      rewardPoints: values.rewardPoints,
      enabled,
      status: enabled ? ('active' as const) : ('paused' as const),
      campaignType: 'demand_based' as const,
      targetTiers: [] as BonusCampaign['targetTiers'],
      targetCities: [] as BonusCampaign['targetCities'],
      tripTarget: 0,
      budget: 0,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
    }
    if (editRecord) {
      await updateProgram({ id: editRecord.id, ...base }).unwrap()
      adminActions.notify('Bonus program updated', values.programName)
    } else {
      await createProgram(base).unwrap()
      adminActions.notify('Bonus program created', values.programName)
    }
    setModalOpen(false)
  }

  return (
    <>
      <ConfigTableHeader
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        status={status}
        onStatusChange={(v) => {
          setStatus(v ?? '')
          setPage(1)
        }}
        searchPlaceholder="Search bonus programs..."
        addLabel="Create Bonus Program"
        onAdd={openCreate}
      />
      <Table
        loading={isLoading || creating || updating}
        rowKey="id"
        dataSource={data?.data ?? []}
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          total: data?.total ?? 0,
          pageSize: PAGE_SIZE,
          onChange: setPage,
          showSizeChanger: false,
        }}
        columns={[
          { title: 'Bonus Name', dataIndex: 'name' },
          { title: 'Requirement', dataIndex: 'requirement' },
          {
            title: 'Reward',
            dataIndex: 'rewardPoints',
            render: (p: number) => <span className="text-emerald-400">+{p} pts</span>,
          },
          {
            title: 'Status',
            render: (_: unknown, record: BonusCampaign) => (
              <StatusBadge status={bonusProgramStatus(record)} />
            ),
          },
          {
            title: 'Start Date',
            dataIndex: 'startDate',
            render: (d: string) => formatDate(d),
          },
          {
            title: 'End Date',
            dataIndex: 'endDate',
            render: (d: string) => formatDate(d),
          },
          createActionsColumn<BonusCampaign>(
            (record) => getRewardsConfigActionItems(bonusProgramStatus(record)),
            (key, record) => void handleAction(key, record),
          ),
        ]}
      />
      <Modal
        title={editRecord ? 'Edit Bonus Program' : 'Create Bonus Program'}
        open={modalOpen}
        confirmLoading={creating || updating}
        okText="Save"
        cancelText="Cancel"
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="programName" label="Bonus Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="requirement" label="Requirement" rules={[{ required: true }]}>
            <Input placeholder="e.g. Complete 20 rides" />
          </Form.Item>
          <Form.Item name="rewardPoints" label="Reward (Points)" rules={[{ required: true }]}>
            <InputNumber min={1} className="w-full" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="endDate" label="End Date" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={REWARDS_STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Bonus Program"
        description={`Delete "${deleteRecord?.name}"?`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteRecord(null)}
        onConfirm={async () => {
          if (!deleteRecord) return
          await deleteProgram(deleteRecord.id).unwrap()
          adminActions.notify('Bonus program deleted', deleteRecord.name)
          setDeleteRecord(null)
        }}
      />
      <AdminActionHost actions={adminActions} />
    </>
  )
}

export function PenaltyRulesTab() {
  const adminActions = useAdminActions()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<PenaltyRule | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<PenaltyRule | null>(null)
  const [form] = Form.useForm<{
    ruleName: string
    deductionPoints: number
    status: PenaltyRule['status']
  }>()

  const { data, isLoading } = useGetPenaltyRulesListQuery({ page, pageSize: PAGE_SIZE, search, status })
  const [createRule, { isLoading: creating }] = useCreatePenaltyRuleMutation()
  const [updateRule, { isLoading: updating }] = useUpdatePenaltyRuleMutation()
  const [deleteRule, { isLoading: deleting }] = useDeletePenaltyRuleMutation()

  const openCreate = () => {
    setEditRecord(null)
    form.resetFields()
    form.setFieldsValue({ status: 'active', deductionPoints: 10 })
    setModalOpen(true)
  }

  const openEdit = (record: PenaltyRule) => {
    setEditRecord(record)
    form.setFieldsValue({
      ruleName: record.ruleName,
      deductionPoints: Math.abs(record.points),
      status: record.status,
    })
    setModalOpen(true)
  }

  const handleAction = async (key: string, record: PenaltyRule) => {
    switch (key) {
      case 'edit':
        openEdit(record)
        break
      case 'delete':
        setDeleteRecord(record)
        break
      case 'enable':
        await updateRule({ id: record.id, status: 'active' }).unwrap()
        adminActions.notify('Penalty rule enabled', record.ruleName)
        break
      case 'disable':
        await updateRule({ id: record.id, status: 'inactive' }).unwrap()
        adminActions.notify('Penalty rule disabled', record.ruleName)
        break
    }
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    const ruleName = values.ruleName.trim()
    const payload: Omit<PenaltyRule, 'id' | 'lastUpdated'> = {
      ruleName,
      actionType: slugify(ruleName),
      points: -Math.abs(values.deductionPoints),
      status: values.status,
    }
    if (editRecord) {
      await updateRule({ id: editRecord.id, ...payload }).unwrap()
      adminActions.notify('Penalty rule updated', ruleName)
    } else {
      await createRule(payload).unwrap()
      adminActions.notify('Penalty rule created', ruleName)
    }
    setModalOpen(false)
  }

  return (
    <>
      <ConfigTableHeader
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        status={status}
        onStatusChange={(v) => {
          setStatus(v ?? '')
          setPage(1)
        }}
        searchPlaceholder="Search penalty rules..."
        addLabel="Add Penalty Rule"
        onAdd={openCreate}
      />
      <Table
        loading={isLoading || creating || updating}
        rowKey="id"
        dataSource={data?.data ?? []}
        scroll={{ x: 700 }}
        pagination={{
          current: page,
          total: data?.total ?? 0,
          pageSize: PAGE_SIZE,
          onChange: setPage,
          showSizeChanger: false,
        }}
        columns={[
          { title: 'Rule Name', dataIndex: 'ruleName' },
          {
            title: 'Deduction Points',
            dataIndex: 'points',
            render: (p: number) => <span className="text-red-400">-{Math.abs(p)}</span>,
          },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<PenaltyRule>(
            (record) => getRewardsConfigActionItems(record.status),
            (key, record) => void handleAction(key, record),
          ),
        ]}
      />
      <Modal
        title={editRecord ? 'Edit Penalty Rule' : 'Add Penalty Rule'}
        open={modalOpen}
        confirmLoading={creating || updating}
        okText="Save"
        cancelText="Cancel"
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="ruleName" label="Rule Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Ride Cancellation" />
          </Form.Item>
          <Form.Item name="deductionPoints" label="Deduction Points" rules={[{ required: true }]}>
            <InputNumber min={1} className="w-full" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={REWARDS_STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Penalty Rule"
        description={`Delete "${deleteRecord?.ruleName}"?`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteRecord(null)}
        onConfirm={async () => {
          if (!deleteRecord) return
          await deleteRule(deleteRecord.id).unwrap()
          adminActions.notify('Penalty rule deleted', deleteRecord.ruleName)
          setDeleteRecord(null)
        }}
      />
      <AdminActionHost actions={adminActions} />
    </>
  )
}
