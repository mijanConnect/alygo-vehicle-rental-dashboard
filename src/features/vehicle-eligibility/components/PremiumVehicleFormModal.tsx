import { Form, Input, InputNumber, Modal, Select } from 'antd'
import { useEffect } from 'react'
import { VEHICLE_ELIGIBILITY_STATUS_OPTIONS } from '@/services/mock/vehicleEligibilityData'
import type { PremiumVehicleApproval, PremiumVehicleFormValues } from '@/types/vehicleEligibility'

interface PremiumVehicleFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  vehicle: PremiumVehicleApproval | null
  categoryOptions: { label: string; value: string }[]
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: PremiumVehicleFormValues) => Promise<void>
}

const defaultValues: PremiumVehicleFormValues = {
  make: '',
  model: '',
  yearRequirement: 2018,
  assignedCategoryIds: [],
  status: 'enabled',
}

export function PremiumVehicleFormModal({
  open,
  mode,
  vehicle,
  categoryOptions,
  loading,
  onCancel,
  onSubmit,
}: PremiumVehicleFormModalProps) {
  const [form] = Form.useForm<PremiumVehicleFormValues>()

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && vehicle) {
      form.setFieldsValue({
        make: vehicle.make,
        model: vehicle.model,
        yearRequirement: vehicle.yearRequirement,
        assignedCategoryIds: vehicle.assignedCategoryIds,
        status: vehicle.status,
      })
    } else {
      form.setFieldsValue(defaultValues)
    }
  }, [open, mode, vehicle, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    await onSubmit(values)
  }

  return (
    <Modal
      title={mode === 'create' ? 'Add Premium Vehicle' : 'Edit Premium Vehicle'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === 'create' ? 'Add Premium Vehicle' : 'Save Changes'}
      confirmLoading={loading}
      destroyOnClose
      width={520}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item name="make" label="Make" rules={[{ required: true, message: 'Make is required' }]}>
          <Input placeholder="e.g. Mercedes-Benz" />
        </Form.Item>
        <Form.Item name="model" label="Model" rules={[{ required: true, message: 'Model is required' }]}>
          <Input placeholder="e.g. E-Class" />
        </Form.Item>
        <Form.Item
          name="yearRequirement"
          label="Eligible Year"
          rules={[{ required: true, message: 'Year requirement is required' }]}
        >
          <InputNumber min={2000} max={2030} className="w-full!" />
        </Form.Item>
        <Form.Item
          name="assignedCategoryIds"
          label="Assigned Categories"
          rules={[{ required: true, message: 'Select at least one category' }]}
        >
          <Select mode="multiple" options={categoryOptions} placeholder="Select categories" />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select options={VEHICLE_ELIGIBILITY_STATUS_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
