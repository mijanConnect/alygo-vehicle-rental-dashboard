import { useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Table } from 'antd'
import { Pencil, Power, PowerOff, Trash2 } from 'lucide-react'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import type { ActionMenuItem } from '@/components/admin/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import {
  MOCK_PRICING_RULES,
  PRICING_RULE_TYPE_LABELS,
  type PricingRule,
  type PricingRuleType,
} from '@/features/pricing/pricingData'
import { useAdminActions } from '@/hooks/useAdminActions'

const RULE_TYPE_OPTIONS = Object.entries(PRICING_RULE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export function PricingRulesPanel() {
  const adminActions = useAdminActions()
  const [rules, setRules] = useState(MOCK_PRICING_RULES)
  const [modalOpen, setModalOpen] = useState(false)
  const [editRule, setEditRule] = useState<PricingRule | null>(null)
  const [form] = Form.useForm()

  const openCreate = () => {
    setEditRule(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (rule: PricingRule) => {
    setEditRule(rule)
    form.setFieldsValue(rule)
    setModalOpen(true)
  }

  const handleSave = (values: Omit<PricingRule, 'id' | 'status'> & { status?: PricingRule['status'] }) => {
    if (editRule) {
      setRules((prev) =>
        prev.map((r) => (r.id === editRule.id ? { ...r, ...values } : r)),
      )
      adminActions.notify(`${values.name} updated`)
    } else {
      const newRule: PricingRule = {
        id: `PR-${Date.now()}`,
        status: 'active',
        ...values,
      }
      setRules((prev) => [...prev, newRule])
      adminActions.notify(`${values.name} created`)
    }
    setModalOpen(false)
    setEditRule(null)
  }

  const toggleStatus = (rule: PricingRule) => {
    const next = rule.status === 'active' ? 'inactive' : 'active'
    setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, status: next } : r)))
    adminActions.notify(`${rule.name} ${next === 'active' ? 'activated' : 'deactivated'}`)
  }

  const deleteRule = (rule: PricingRule) => {
    adminActions.openConfirm({
      title: 'Delete Pricing Rule',
      description: `Delete rule "${rule.name}"?`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: async () => {
        setRules((prev) => prev.filter((r) => r.id !== rule.id))
        adminActions.notify(`${rule.name} deleted`)
      },
    })
  }

  const actionItems = (rule: PricingRule): ActionMenuItem[] => [
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-alygo-text-muted">
          Configure demand/supply thresholds and multiplier bounds for surge pricing rules.
        </p>
        <Button type="primary" onClick={openCreate}>
          Add Rule
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={rules}
        scroll={{ x: 1100 }}
        {...createTableRowProps<PricingRule>((record) => openEdit(record))}
        columns={[
          { title: 'Rule Name', dataIndex: 'name' },
          {
            title: 'Rule Type',
            dataIndex: 'ruleType',
            render: (t: PricingRuleType) => PRICING_RULE_TYPE_LABELS[t],
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
          createActionsColumn<PricingRule>(
            (record) => actionItems(record),
            (key, record) => {
              if (key === 'edit') openEdit(record)
              else if (key === 'toggle') toggleStatus(record)
              else if (key === 'delete') deleteRule(record)
            },
          ),
        ]}
      />

      <Modal
        title={editRule ? `Edit Rule — ${editRule.name}` : 'Add Pricing Rule'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditRule(null)
        }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4" onFinish={handleSave}>
          <Form.Item name="name" label="Rule Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Default Surge" />
          </Form.Item>
          <Form.Item name="ruleType" label="Rule Type" rules={[{ required: true }]}>
            <Select options={RULE_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="demandThreshold" label="Demand Threshold (%)" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} className="w-full" />
          </Form.Item>
          <Form.Item name="supplyThreshold" label="Supply Threshold (%)" rules={[{ required: true }]}>
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
