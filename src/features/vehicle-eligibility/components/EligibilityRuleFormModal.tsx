import { Form, InputNumber, Modal, Select, Switch } from 'antd'
import { useEffect } from 'react'
import { VEHICLE_ELIGIBILITY_STATUS_OPTIONS } from '@/services/mock/vehicleEligibilityData'
import type {
  CategoryEligibilityRule,
  CategoryEligibilityRuleFormValues,
} from '@/types/vehicleEligibility'

interface EligibilityRuleFormModalProps {
  open: boolean
  rule: CategoryEligibilityRule | null
  categoryOptions: { label: string; value: string }[]
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: CategoryEligibilityRuleFormValues) => Promise<void>
}

export function EligibilityRuleFormModal({
  open,
  rule,
  categoryOptions,
  loading,
  onCancel,
  onSubmit,
}: EligibilityRuleFormModalProps) {
  const [form] = Form.useForm<CategoryEligibilityRuleFormValues>()

  useEffect(() => {
    if (!open || !rule) return
    form.setFieldsValue({
      categoryId: rule.categoryId,
      minVehicleYear: rule.minVehicleYear,
      minDriverRating: rule.minDriverRating,
      commercialInsuranceRequired: rule.commercialInsuranceRequired,
      status: rule.status,
    })
  }, [open, rule, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    await onSubmit(values)
  }

  return (
    <Modal
      title="Edit Eligibility Rule"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Save Changes"
      confirmLoading={loading}
      destroyOnClose
      width={520}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
          <Select options={categoryOptions} disabled />
        </Form.Item>
        <Form.Item
          name="minVehicleYear"
          label="Minimum Vehicle Year"
          rules={[{ required: true }]}
        >
          <InputNumber min={2000} max={2030} className="w-full!" />
        </Form.Item>
        <Form.Item
          name="minDriverRating"
          label="Minimum Driver Rating"
          rules={[{ required: true }]}
        >
          <InputNumber min={1} max={5} step={0.1} className="w-full!" />
        </Form.Item>
        <Form.Item
          name="commercialInsuranceRequired"
          label="Commercial Insurance Required"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select options={VEHICLE_ELIGIBILITY_STATUS_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
