import { DatePicker, Form, Input, Modal, Select } from 'antd'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { RIDE_CATEGORY_LABELS } from '@/constants'
import type { DriverRestrictionFormValues, DriverRestrictionRecord } from '@/types/complianceCenter'

const CATEGORY_OPTIONS = Object.values(RIDE_CATEGORY_LABELS).map((label) => ({
  label,
  value: label,
}))

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

interface DriverRestrictionFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  restriction: DriverRestrictionRecord | null
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: DriverRestrictionFormValues) => Promise<void>
}

export function DriverRestrictionFormModal({
  open,
  mode,
  restriction,
  loading,
  onCancel,
  onSubmit,
}: DriverRestrictionFormModalProps) {
  const [form] = Form.useForm<{
    driverName: string
    reason: string
    restrictedCategories: string[]
    restrictionEndDate?: dayjs.Dayjs
    status: DriverRestrictionFormValues['status']
  }>()

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && restriction) {
      form.setFieldsValue({
        driverName: restriction.driverName,
        reason: restriction.reason,
        restrictedCategories: restriction.restrictedCategories,
        restrictionEndDate: restriction.restrictionEndDate
          ? dayjs(restriction.restrictionEndDate)
          : undefined,
        status: restriction.status,
      })
    } else {
      form.resetFields()
      form.setFieldsValue({ status: 'active', restrictedCategories: [] })
    }
  }, [open, mode, restriction, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    await onSubmit({
      driverName: values.driverName,
      reason: values.reason,
      restrictedCategories: values.restrictedCategories,
      restrictionEndDate: values.restrictionEndDate
        ? values.restrictionEndDate.toISOString()
        : undefined,
      status: values.status,
    })
  }

  return (
    <Modal
      title={mode === 'create' ? 'Add Restriction' : 'Edit Restriction'}
      open={open}
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item name="driverName" label="Driver" rules={[{ required: true }]}>
          <Input placeholder="Driver name" />
        </Form.Item>
        <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
          <Input.TextArea rows={2} placeholder="Reason for restriction" />
        </Form.Item>
        <Form.Item
          name="restrictedCategories"
          label="Restricted Categories"
          rules={[{ required: true, message: 'Select at least one category' }]}
        >
          <Select mode="multiple" options={CATEGORY_OPTIONS} placeholder="Select categories" />
        </Form.Item>
        <Form.Item name="restrictionEndDate" label="Restriction End Date">
          <DatePicker className="w-full" />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select options={STATUS_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
