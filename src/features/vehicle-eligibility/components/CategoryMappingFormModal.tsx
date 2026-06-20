import { Form, Modal, Select } from 'antd'
import { useEffect } from 'react'
import {
  CATEGORY_MAPPING_STATUS_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
} from '@/services/mock/vehicleEligibilityData'
import type {
  CategoryAssignmentMapping,
  CategoryMappingFormValues,
} from '@/types/vehicleEligibility'

interface CategoryMappingFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  mapping: CategoryAssignmentMapping | null
  categoryOptions: { label: string; value: string }[]
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: CategoryMappingFormValues) => Promise<void>
}

const defaultValues: CategoryMappingFormValues = {
  vehicleType: '',
  rideCategoryId: '',
  status: 'active',
}

export function CategoryMappingFormModal({
  open,
  mode,
  mapping,
  categoryOptions,
  loading,
  onCancel,
  onSubmit,
}: CategoryMappingFormModalProps) {
  const [form] = Form.useForm<CategoryMappingFormValues>()

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && mapping) {
      form.setFieldsValue({
        vehicleType: mapping.vehicleType,
        rideCategoryId: mapping.rideCategoryId,
        status: mapping.status,
      })
    } else {
      form.setFieldsValue(defaultValues)
    }
  }, [open, mode, mapping, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    await onSubmit(values)
  }

  return (
    <Modal
      title={mode === 'create' ? 'Add Category Mapping' : 'Edit Category Mapping'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === 'create' ? 'Save Mapping' : 'Update Mapping'}
      confirmLoading={loading}
      destroyOnClose
      width={480}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="vehicleType"
          label="Vehicle Type"
          rules={[{ required: true, message: 'Vehicle type is required' }]}
        >
          <Select
            showSearch
            options={VEHICLE_TYPE_OPTIONS}
            placeholder="Select vehicle type"
          />
        </Form.Item>
        <Form.Item
          name="rideCategoryId"
          label="Assigned Ride Category"
          rules={[{ required: true, message: 'Ride category is required' }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            options={categoryOptions}
            placeholder="Select ride category"
          />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select options={CATEGORY_MAPPING_STATUS_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
