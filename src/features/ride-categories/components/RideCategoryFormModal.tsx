import { Form, Input, InputNumber, Modal, Select } from 'antd'
import { useEffect } from 'react'
import {
  defaultRideCategoryFormValues,
  rideCategoryToFormValues,
  VEHICLE_TYPE_OPTIONS,
  type RideCategoryFormValues,
  type RideCategoryRow,
} from '@/features/ride-categories/mapRideCategory'

interface RideCategoryFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: RideCategoryRow | null
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: RideCategoryFormValues) => Promise<void>
}

export function RideCategoryFormModal({
  open,
  mode,
  initialValues,
  loading,
  onCancel,
  onSubmit,
}: RideCategoryFormModalProps) {
  const [form] = Form.useForm<RideCategoryFormValues>()

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initialValues) {
      form.setFieldsValue(rideCategoryToFormValues(initialValues))
    } else {
      form.setFieldsValue(defaultRideCategoryFormValues())
    }
  }, [open, mode, initialValues, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    await onSubmit(values)
  }

  return (
    <Modal
      title={mode === 'create' ? 'Create Category' : 'Edit Category'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === 'create' ? 'Create Category' : 'Save Changes'}
      confirmLoading={loading}
      destroyOnClose
      width={640}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="name"
          label="Category Name"
          rules={[{ required: true, message: 'Category name is required' }]}
        >
          <Input placeholder="e.g. Alygo Standard" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Description is required' }]}
        >
          <Input.TextArea rows={3} placeholder="Describe this ride category" />
        </Form.Item>
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4">
          <Form.Item
            name="commissionRate"
            label="Commission Rate (%)"
            rules={[{ required: true, message: 'Commission rate is required' }]}
          >
            <InputNumber min={0} max={100} step={0.1} className="!w-full" addonAfter="%" />
          </Form.Item>
          <Form.Item
            name="minimumDriverRating"
            label="Minimum Driver Rating"
            rules={[{ required: true, message: 'Minimum rating is required' }]}
          >
            <InputNumber min={0} max={5} step={0.1} className="!w-full" />
          </Form.Item>
        </div>
        <Form.Item name="serviceCategoryId" label="Service Category ID">
          <Input placeholder="Optional linked service category ID" />
        </Form.Item>
        <Form.Item
          name={['vehicleRequirements', 'vehicleTypes']}
          label="Vehicle Types"
          rules={[{ required: true, message: 'Select at least one vehicle type' }]}
        >
          <Select mode="multiple" options={VEHICLE_TYPE_OPTIONS} placeholder="Select vehicle types" />
        </Form.Item>
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4">
          <Form.Item
            name={['vehicleRequirements', 'minimumSeats']}
            label="Minimum Seats"
            rules={[{ required: true, message: 'Minimum seats is required' }]}
          >
            <InputNumber min={1} max={20} className="!w-full" />
          </Form.Item>
          <Form.Item name={['vehicleRequirements', 'luggageCapacity']} label="Luggage Capacity">
            <InputNumber min={0} max={99} className="!w-full" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
