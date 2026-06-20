import { Form, Input, InputNumber, Modal, Select } from 'antd'
import { useEffect } from 'react'
import { CATEGORY_OPTIONS, STATE_OPTIONS } from '@/services/mock/backgroundCheckFeeData'
import type { BackgroundCheckFeeConfig } from '@/types/backgroundCheckFee'

export type BackgroundCheckFeeFormValues = Omit<BackgroundCheckFeeConfig, 'id'>

interface BackgroundCheckFeeFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  fee: BackgroundCheckFeeConfig | null
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: BackgroundCheckFeeFormValues) => Promise<void>
}

const defaultValues: BackgroundCheckFeeFormValues = {
  feeName: '',
  amount: 0,
  state: 'California',
  category: 'standard',
  refundable: true,
  status: 'active',
}

export function BackgroundCheckFeeFormModal({
  open,
  mode,
  fee,
  loading,
  onCancel,
  onSubmit,
}: BackgroundCheckFeeFormModalProps) {
  const [form] = Form.useForm<BackgroundCheckFeeFormValues>()

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && fee) {
      form.setFieldsValue(fee)
    } else {
      form.setFieldsValue(defaultValues)
    }
  }, [open, mode, fee, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    await onSubmit(values)
  }

  return (
    <Modal
      title={mode === 'create' ? 'Add Fee' : 'Edit Fee'}
      open={open}
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item name="feeName" label="Fee Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
          <InputNumber min={0} prefix="$" className="w-full" />
        </Form.Item>
        <Form.Item name="state" label="Applicable State" rules={[{ required: true }]}>
          <Select options={STATE_OPTIONS} />
        </Form.Item>
        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Select options={CATEGORY_OPTIONS} />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
