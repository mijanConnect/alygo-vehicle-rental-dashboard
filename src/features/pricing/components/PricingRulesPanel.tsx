import { useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Table } from 'antd'
import { Pencil, Plus, Power, PowerOff, Trash2 } from 'lucide-react'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import type { ActionMenuItem } from '@/components/admin/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { PRICING_RULE_TYPE_LABELS, type PricingRuleType } from '@/features/pricing/pricingData'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCreateDynamicPricingMutation,
  useDeleteDynamicPricingMutation,
  useGetDynamicPricingListQuery,
  useUpdateDynamicPricingMutation,
  useUpdateDynamicPricingStatusMutation,
} from '@/redux/api/dynamicPricingApi'
import type {
  SurgeRuleItem,
  SurgeRuleStatus,
  SurgeRuleWritePayload,
} from '@/redux/api/dynamicPricingApi'
import { formatDateTime } from '@/utils/format'

const RULE_TYPE_OPTIONS = Object.entries(PRICING_RULE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

type SurgeRuleFormValues = SurgeRuleWritePayload

export function PricingRulesPanel() {
  const adminActions = useAdminActions()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editRule, setEditRule] = useState<SurgeRuleItem | null>(null)
  const [form] = Form.useForm<SurgeRuleFormValues>()

  const { data, isLoading, isFetching } = useGetDynamicPricingListQuery({
    page,
    limit,
    searchTerm,
    status: status || undefined,
  })

  const [createRule, { isLoading: creating }] = useCreateDynamicPricingMutation()
  const [updateRule, { isLoading: updating }] = useUpdateDynamicPricingMutation()
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateDynamicPricingStatusMutation()
  const [deleteRule, { isLoading: deleting }] = useDeleteDynamicPricingMutation()

  const rows = data?.data ?? []
  const meta = data?.meta

  const openCreate = () => {
    setEditRule(null)
    form.resetFields()
    form.setFieldsValue({
      ruleType: 'peak_hour_surge',
      demandThreshold: 80,
      supplyThreshold: 40,
      minMultiplier: 1.2,
      maxMultiplier: 3.5,
    })
    setModalOpen(true)
  }

  const openEdit = (rule: SurgeRuleItem) => {
    setEditRule(rule)
    form.setFieldsValue({
      ruleName: rule.ruleName,
      ruleType: rule.ruleType,
      demandThreshold: rule.demandThreshold,
      supplyThreshold: rule.supplyThreshold,
      minMultiplier: rule.minMultiplier,
      maxMultiplier: rule.maxMultiplier,
    })
    setModalOpen(true)
  }

  const handleSave = async (values: SurgeRuleFormValues) => {
    const payload: SurgeRuleWritePayload = {
      ruleName: values.ruleName.trim(),
      ruleType: values.ruleType,
      demandThreshold: values.demandThreshold,
      supplyThreshold: values.supplyThreshold,
      minMultiplier: values.minMultiplier,
      maxMultiplier: values.maxMultiplier,
    }

    try {
      if (editRule) {
        await updateRule({ id: editRule._id, body: payload }).unwrap()
        adminActions.notify('Rule updated', payload.ruleName)
      } else {
        await createRule(payload).unwrap()
        adminActions.notify('Rule created', payload.ruleName)
      }
      setModalOpen(false)
      setEditRule(null)
    } catch (err) {
      adminActions.notify('Unable to save rule', String(err))
    }
  }

  const toggleStatus = async (rule: SurgeRuleItem) => {
    const next: SurgeRuleStatus = rule.status === 'active' ? 'inactive' : 'active'
    try {
      await updateStatus({ id: rule._id, status: next }).unwrap()
      adminActions.notify(
        next === 'active' ? 'Rule activated' : 'Rule deactivated',
        rule.ruleName,
      )
    } catch (err) {
      adminActions.notify('Unable to update status', String(err))
    }
  }

  const confirmDelete = (rule: SurgeRuleItem) => {
    adminActions.openConfirm({
      title: 'Delete Pricing Rule',
      description: `Delete rule "${rule.ruleName}"?`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: async () => {
        try {
          await deleteRule(rule._id).unwrap()
          adminActions.notify('Rule deleted', rule.ruleName)
        } catch (err) {
          adminActions.notify('Unable to delete rule', String(err))
        }
      },
    })
  }

  const actionItems = (rule: SurgeRuleItem): ActionMenuItem[] => [
    { key: 'edit', label: 'Edit Rule', icon: Pencil, group: 1 },
    {
      key: 'toggle',
      label: rule.status === 'active' ? 'Deactivate' : 'Activate',
      icon: rule.status === 'active' ? PowerOff : Power,
      group: 1,
    },
    { key: 'delete', label: 'Delete Rule', icon: Trash2, danger: true, group: 2 },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <SearchingInput
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value)
              setPage(1)
            }}
            placeholder="Search surge rules..."
          />
          <Select
            allowClear
            placeholder="Filter by status"
            className="!min-w-[160px]"
            value={status || undefined}
            options={STATUS_OPTIONS}
            onChange={(value) => {
              setStatus(value ?? '')
              setPage(1)
            }}
          />
        </div>
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Add Rule
        </Button>
      </div>

      <Table
        loading={isLoading || isFetching || creating || updating || updatingStatus || deleting}
        rowKey="_id"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 1100 }}
        {...createTableRowProps<SurgeRuleItem>((record) => openEdit(record))}
        columns={[
          { title: 'Rule Name', dataIndex: 'ruleName' },
          {
            title: 'Rule Type',
            dataIndex: 'ruleType',
            render: (t: PricingRuleType) => PRICING_RULE_TYPE_LABELS[t] ?? t,
          },
          {
            title: 'Demand Threshold',
            dataIndex: 'demandThreshold',
            render: (v: number) => `${v}%`,
          },
          {
            title: 'Supply Threshold',
            dataIndex: 'supplyThreshold',
            render: (v: number) => `${v}%`,
          },
          {
            title: 'Min Multiplier',
            dataIndex: 'minMultiplier',
            render: (v: number) => `${v}x`,
          },
          {
            title: 'Max Multiplier',
            dataIndex: 'maxMultiplier',
            render: (v: number) => `${v}x`,
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => <StatusBadge status={s} />,
          },
          {
            title: 'Updated',
            dataIndex: 'updatedAt',
            render: (d?: string) => (d ? formatDateTime(d) : '—'),
          },
          createActionsColumn<SurgeRuleItem>(
            (record) => actionItems(record),
            (key, record) => {
              if (key === 'edit') openEdit(record)
              else if (key === 'toggle') void toggleStatus(record)
              else if (key === 'delete') confirmDelete(record)
            },
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
        title={editRule ? `Edit Rule — ${editRule.ruleName}` : 'Add Pricing Rule'}
        open={modalOpen}
        confirmLoading={creating || updating}
        onCancel={() => {
          setModalOpen(false)
          setEditRule(null)
        }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4" onFinish={handleSave}>
          <Form.Item name="ruleName" label="Rule Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Holiday Hour Surge" />
          </Form.Item>
          <Form.Item name="ruleType" label="Rule Type" rules={[{ required: true }]}>
            <Select options={RULE_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item
            name="demandThreshold"
            label="Demand Threshold (%)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={100} className="w-full" />
          </Form.Item>
          <Form.Item
            name="supplyThreshold"
            label="Supply Threshold (%)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} max={100} className="w-full" />
          </Form.Item>
          <Form.Item name="minMultiplier" label="Min Multiplier" rules={[{ required: true }]}>
            <InputNumber min={1} max={10} step={0.1} className="w-full" />
          </Form.Item>
          <Form.Item name="maxMultiplier" label="Max Multiplier" rules={[{ required: true }]}>
            <InputNumber min={1} max={10} step={0.1} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>

      <AdminActionHost actions={adminActions} />
    </div>
  )
}
