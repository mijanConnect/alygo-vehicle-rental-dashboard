import { Form, Input, InputNumber, Modal, Select, DatePicker } from 'antd'
import { useEffect } from 'react'
import dayjs from 'dayjs'
import type { BonusCampaign, BonusCampaignFormValues } from '@/types/driverBonus'

const { RangePicker } = DatePicker

interface BonusCampaignFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: BonusCampaign | null
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: BonusCampaignFormValues) => Promise<void>
}

const defaultValues: Partial<BonusCampaignFormValues> = {
  name: '',
  type: 'quest',
  amount: 0,
  location: 'All Zones',
  tierEligibility: [],
  rideCategoryEligibility: [],
  budgetLimit: 0,
  status: 'active',
}

const BONUS_TYPES = [
  { value: 'quest', label: 'Quest' },
  { value: 'peak_hour', label: 'Peak Hour' },
  { value: 'airport', label: 'Airport' },
  { value: 'zone_based', label: 'Zone Based' },
  { value: 'event', label: 'Event' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'consecutive_trips', label: 'Consecutive Trips' },
  { value: 'new_driver', label: 'New Driver' },
  { value: 'retention', label: 'Retention' },
]

const TIER_OPTIONS = [
  { value: 'Bronze', label: 'Bronze' },
  { value: 'Silver', label: 'Silver' },
  { value: 'Gold', label: 'Gold' },
  { value: 'Platinum', label: 'Platinum' },
]

const CATEGORY_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'comfort', label: 'Comfort' },
  { value: 'xl', label: 'XL' },
  { value: 'pet', label: 'Pet' },
  { value: 'priority', label: 'Priority' },
  { value: 'black', label: 'Black' },
  { value: 'black_suv', label: 'Black SUV' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'completed', label: 'Completed' },
]

export function BonusCampaignFormModal({
  open,
  mode,
  initialValues,
  loading,
  onCancel,
  onSubmit,
}: BonusCampaignFormModalProps) {
  const [form] = Form.useForm<any>()

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        type: initialValues.type,
        amount: initialValues.amount,
        dateRange: [dayjs(initialValues.startDate), dayjs(initialValues.endDate)],
        location: initialValues.location,
        tierEligibility: initialValues.tierEligibility,
        rideCategoryEligibility: initialValues.rideCategoryEligibility,
        budgetLimit: initialValues.budgetLimit,
        status: initialValues.status,
      })
    } else {
      form.setFieldsValue(defaultValues)
    }
  }, [open, mode, initialValues, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    
    // Transform dateRange to startDate and endDate
    const payload: BonusCampaignFormValues = {
      ...values,
      startDate: values.dateRange ? values.dateRange[0].toISOString() : new Date().toISOString(),
      endDate: values.dateRange ? values.dateRange[1].toISOString() : new Date().toISOString(),
    }
    delete (payload as any).dateRange

    await onSubmit(payload)
  }

  return (
    <Modal
      title={mode === 'create' ? 'Create Bonus Campaign' : 'Edit Bonus Campaign'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === 'create' ? 'Create Campaign' : 'Save Changes'}
      confirmLoading={loading}
      destroyOnClose
      width={640}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="name"
          label="Campaign Name"
          rules={[{ required: true, message: 'Campaign name is required' }]}
        >
          <Input placeholder="e.g. Weekend Warrior Quest" />
        </Form.Item>
        
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4">
          <Form.Item
            name="type"
            label="Bonus Type"
            rules={[{ required: true }]}
          >
            <Select options={BONUS_TYPES} />
          </Form.Item>
          
          <Form.Item
            name="amount"
            label="Bonus Amount ($)"
            rules={[{ required: true, message: 'Amount is required' }]}
          >
            <InputNumber min={0} prefix="$" className="!w-full" />
          </Form.Item>
        </div>

        <Form.Item
          name="dateRange"
          label="Active Period"
          rules={[{ required: true, message: 'Date range is required' }]}
        >
          <RangePicker showTime className="!w-full" />
        </Form.Item>

        <Form.Item
          name="location"
          label="Target Location (City or Zone)"
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g. All Zones, Downtown Core" />
        </Form.Item>

        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4">
          <Form.Item
            name="tierEligibility"
            label="Driver Tier Eligibility"
            rules={[{ required: true, message: 'Select at least one tier' }]}
          >
            <Select mode="multiple" placeholder="Select tiers" options={TIER_OPTIONS} />
          </Form.Item>

          <Form.Item
            name="rideCategoryEligibility"
            label="Ride Category Eligibility"
            rules={[{ required: true, message: 'Select at least one category' }]}
          >
            <Select mode="multiple" placeholder="Select categories" options={CATEGORY_OPTIONS} />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4">
          <Form.Item
            name="budgetLimit"
            label="Budget Limit ($)"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} prefix="$" className="!w-full" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true }]}
          >
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
