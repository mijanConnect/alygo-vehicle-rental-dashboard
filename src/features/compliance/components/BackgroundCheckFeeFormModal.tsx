import { Form, Input, InputNumber, Modal, Select } from 'antd'
import { useEffect } from 'react'
import { useGetServiceAreaCitiesQuery } from '@/redux/api/areaServiceApi'
import type { BackgroundCheckFeeConfig } from '@/types/backgroundCheckFee'

export type BackgroundCheckFeeFormValues = Omit<BackgroundCheckFeeConfig, 'id' | 'cityName'>

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
  serviceAreaId: '',
  description: '',
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
  const { data: citiesData, isLoading: loadingCities } = useGetServiceAreaCitiesQuery({ limit: 100 })

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && fee) {
      form.setFieldsValue({
        feeName: fee.feeName,
        amount: fee.amount,
        serviceAreaId: fee.serviceAreaId,
        description: fee.description,
        status: fee.status,
      })
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
        <Form.Item name="serviceAreaId" label="Service Area" rules={[{ required: true, message: 'Please select a service area' }]}>
          <Select
            showSearch
            loading={loadingCities}
            placeholder="Select Service Area"
            optionFilterProp="children"
            options={citiesData?.data?.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
          />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <Input.TextArea rows={3} placeholder="Enter fee description..." />
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
