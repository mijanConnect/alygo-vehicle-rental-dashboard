import { useState } from 'react'
import { Button, Form, InputNumber, Modal, Spin, Switch } from 'antd'
import { Pencil } from 'lucide-react'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetLostAndFoundDeliveryFeeQuery,
  useUpdateLostAndFoundDeliveryFeeMutation,
  type LostFoundDeliveryFeeSettings,
} from '@/redux/api/lostandfound/lostAndFoundApi'
import { formatCurrency } from '@/utils/format'

const FIELD_META: {
  key: keyof LostFoundDeliveryFeeSettings
  label: string
  description: string
  kind: 'switch' | 'days' | 'hours' | 'count' | 'mb' | 'currency'
}[] = [
  {
    key: 'enabled',
    label: 'Delivery Fee Enabled',
    description: 'Turn delivery fee collection on or off',
    kind: 'switch',
  },
  {
    key: 'reportWindowDays',
    label: 'Report Window',
    description: 'Days allowed to submit a lost item report',
    kind: 'days',
  },
  {
    key: 'maxFiles',
    label: 'Max Files',
    description: 'Maximum attachments per report',
    kind: 'count',
  },
  {
    key: 'maxFileSizeMb',
    label: 'Max File Size',
    description: 'Maximum size per uploaded file',
    kind: 'mb',
  },
  {
    key: 'defaultDeliveryFee',
    label: 'Default Delivery Fee',
    description: 'Default fee charged for driver delivery returns',
    kind: 'currency',
  },
  {
    key: 'returnConfirmationHours',
    label: 'Return Confirmation Window',
    description: 'Hours to confirm a completed return',
    kind: 'hours',
  },
  {
    key: 'autoCloseDays',
    label: 'Auto Close Days',
    description: 'Days before an inactive case auto-closes',
    kind: 'days',
  },
]

function formatValue(
  value: boolean | number,
  kind: (typeof FIELD_META)[number]['kind'],
) {
  if (kind === 'switch') return value ? 'Enabled' : 'Disabled'
  if (kind === 'currency') return formatCurrency(Number(value))
  if (kind === 'days') return `${value} days`
  if (kind === 'hours') return `${value} hours`
  if (kind === 'mb') return `${value} MB`
  return String(value)
}

export function DeliveryFeeSettingsTable() {
  const adminActions = useAdminActions()
  const { data, isLoading, isFetching } = useGetLostAndFoundDeliveryFeeQuery()
  const [updateSettings, { isLoading: saving }] =
    useUpdateLostAndFoundDeliveryFeeMutation()
  const [editOpen, setEditOpen] = useState(false)
  const [form] = Form.useForm<LostFoundDeliveryFeeSettings>()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spin />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-10 text-center text-alygo-text-muted">
        No delivery fee settings found.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Delivery Fee Settings</h3>
          <p className="mt-1 text-sm text-alygo-text-muted">
            Configure report windows, file limits, delivery fees, and auto-close rules.
          </p>
        </div>
        <Button
          type="primary"
          icon={<Pencil className="h-4 w-4" />}
          loading={isFetching}
          onClick={() => {
            form.setFieldsValue(data)
            setEditOpen(true)
          }}
        >
          Edit Settings
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {FIELD_META.map(({ key, label, description, kind }) => (
          <div
            key={key}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <p className="text-sm font-medium text-white">{label}</p>
            <p className="mt-1 text-xs text-alygo-text-muted">{description}</p>
            <p className="mt-3 text-xl font-semibold text-white">
              {formatValue(data[key], kind)}
            </p>
          </div>
        ))}
      </div>

      <Modal
        title="Edit Delivery Fee Settings"
        open={editOpen}
        confirmLoading={saving}
        onCancel={() => setEditOpen(false)}
        onOk={() => form.submit()}
        okText="Save Settings"
        width={640}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
          onFinish={async (values) => {
            try {
              await updateSettings(values).unwrap()
              adminActions.notify('Delivery fee settings updated')
              setEditOpen(false)
            } catch {
              adminActions.notify('Unable to update delivery fee settings')
            }
          }}
        >
          <Form.Item
            name="enabled"
            label="Delivery Fee Enabled"
            valuePropName="checked"
          >
            <Switch checkedChildren="On" unCheckedChildren="Off" />
          </Form.Item>

          <div className="grid gap-3 sm:grid-cols-2">
            <Form.Item
              name="reportWindowDays"
              label="Report Window (Days)"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber min={1} className="!h-[45px] w-full" controls={false} />
            </Form.Item>
            <Form.Item
              name="maxFiles"
              label="Max Files"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber min={1} className="!h-[45px] w-full" controls={false} />
            </Form.Item>
            <Form.Item
              name="maxFileSizeMb"
              label="Max File Size (MB)"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber min={1} className="!h-[45px] w-full" controls={false} />
            </Form.Item>
            <Form.Item
              name="defaultDeliveryFee"
              label="Default Delivery Fee"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber min={0} className="!h-[45px] w-full" controls={false} />
            </Form.Item>
            <Form.Item
              name="returnConfirmationHours"
              label="Return Confirmation (Hours)"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber min={1} className="!h-[45px] w-full" controls={false} />
            </Form.Item>
            <Form.Item
              name="autoCloseDays"
              label="Auto Close (Days)"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber min={1} className="!h-[45px] w-full" controls={false} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
