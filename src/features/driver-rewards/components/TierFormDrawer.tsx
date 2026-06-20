import { Button, Drawer, Form, Input, InputNumber, Select, Switch, Tabs } from 'antd'
import type { DriverLevel, TierBenefitsConfig } from '@/types/driverRewards'
import { syncBenefitFlags } from '@/features/driver-rewards/utils/tierConfigHelpers'
import { createDefaultLevel, createTierRequirements } from '@/features/driver-rewards/utils/tierDefaults'

export type TierFormValues = Omit<DriverLevel, 'id' | 'benefitsCount' | 'driverCount'>

interface TierFormDrawerProps {
  open: boolean
  title: string
  initialValues?: Partial<TierFormValues>
  confirmLoading?: boolean
  onClose: () => void
  onSubmit: (values: TierFormValues) => void
}

function buildDefaultFormValues(): TierFormValues {
  const template = createDefaultLevel('tmp', 'custom_tier', '', '', 1, 1, {})
  return {
    name: 'custom_tier',
    slug: 'custom-tier',
    label: '',
    description: '',
    level: 1,
    icon: 'award',
    requiredPoints: 0,
    requiredRating: 4.5,
    requiredTrips: 0,
    requiredOnlineHours: 0,
    requiredAcceptanceRate: 85,
    requiredCompletionRate: 92,
    requirements: createTierRequirements(),
    benefits: template.benefits,
    tierColor: '#6366f1',
    tierBadge: 'T',
    status: 'active',
    sortOrder: 1,
  }
}

const defaultValues = buildDefaultFormValues()

const reservationAccessOptions = [
  { value: 'none', label: 'No Access' },
  { value: 'standard', label: 'Standard Access' },
  { value: 'priority', label: 'Priority Access' },
  { value: 'exclusive', label: 'Exclusive Priority Access' },
]

const supportLevelOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'priority', label: 'Priority' },
  { value: 'vip', label: 'VIP' },
]

function BenefitSwitch({ name, label }: { name: keyof TierBenefitsConfig; label: string }) {
  return (
    <Form.Item name={['benefits', name]} label={label} valuePropName="checked">
      <Switch />
    </Form.Item>
  )
}

export function TierFormDrawer({
  open,
  title,
  initialValues,
  confirmLoading,
  onClose,
  onSubmit,
}: TierFormDrawerProps) {
  const [form] = Form.useForm<TierFormValues>()

  const tabItems = [
    {
      key: 'general',
      label: 'General',
      children: (
        <>
          <Form.Item name="label" label="Tier Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Elite" />
          </Form.Item>
          <Form.Item name="name" label="Tier Key" rules={[{ required: true }]}>
            <Input placeholder="e.g. elite" />
          </Form.Item>
          <Form.Item name="description" label="Tier Description" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="requiredPoints" label="Required Points" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="level" label="Tier Level" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item name="sortOrder" label="Sort Order" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="tierColor" label="Tier Color" rules={[{ required: true }]}>
              <Input type="color" className="h-10 w-full" />
            </Form.Item>
            <Form.Item name="tierBadge" label="Tier Badge" rules={[{ required: true }]}>
              <Input maxLength={4} placeholder="e.g. E" />
            </Form.Item>
          </div>
          <Form.Item name="status" label="Tier Status" rules={[{ required: true }]}>
            <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </Form.Item>
        </>
      ),
    },
    {
      key: 'destination-filters',
      label: 'Destination Filters',
      children: (
        <div className="grid grid-cols-2 gap-3">
          <Form.Item name={['benefits', 'destinationFilters']} label="Destination Filter Count">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name={['benefits', 'dailyUsageLimit']} label="Daily Filter Limit">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name={['benefits', 'weeklyUsageLimit']} label="Weekly Filter Limit">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name={['benefits', 'filterExpirationHours']} label="Filter Expiration Hours">
            <InputNumber min={1} className="w-full" />
          </Form.Item>
          <Form.Item name={['benefits', 'filterCooldownHours']} label="Filter Cooldown Hours">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name={['benefits', 'filterCooldownRule']} label="Filter Cooldown Rules" className="col-span-2">
            <Input.TextArea rows={2} />
          </Form.Item>
        </div>
      ),
    },
    {
      key: 'reservations',
      label: 'Reservations',
      children: (
        <div className="grid grid-cols-2 gap-3">
          <Form.Item name={['benefits', 'reservationAccess']} label="Reservation Access">
            <Select options={reservationAccessOptions} />
          </Form.Item>
          <BenefitSwitch name="advanceBookingAccess" label="Advance Booking Access" />
          <Form.Item name={['benefits', 'reservationPriority']} label="Reservation Priority">
            <InputNumber min={0} max={10} className="w-full" />
          </Form.Item>
          <Form.Item name={['benefits', 'maxReservationDistanceMiles']} label="Max Reservation Distance (mi)">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name={['benefits', 'reservationQueuePriority']} label="Reservation Queue Priority">
            <InputNumber min={0} max={10} className="w-full" />
          </Form.Item>
        </div>
      ),
    },
    {
      key: 'dispatch',
      label: 'Dispatch',
      children: (
        <div className="grid grid-cols-2 gap-3">
          <Form.Item name={['benefits', 'dispatchPriorityLevel']} label="Dispatch Priority Level">
            <InputNumber min={1} max={5} className="w-full" />
          </Form.Item>
          <Form.Item name={['benefits', 'rideMatchingPriority']} label="Ride Matching Priority">
            <InputNumber min={1} max={5} className="w-full" />
          </Form.Item>
          <BenefitSwitch name="preferredRideAllocation" label="Preferred Ride Allocation" />
        </div>
      ),
    },
    {
      key: 'rewards',
      label: 'Rewards',
      children: (
        <div className="grid grid-cols-2 gap-3">
          <Form.Item name={['benefits', 'bonusMultiplier']} label="Bonus Multiplier">
            <InputNumber min={1} max={5} step={0.05} className="w-full" />
          </Form.Item>
          <Form.Item name={['benefits', 'peakHourMultiplier']} label="Peak Hour Multiplier">
            <InputNumber min={1} max={5} step={0.05} className="w-full" />
          </Form.Item>
          <Form.Item name={['benefits', 'referralBonusMultiplier']} label="Referral Bonus Multiplier">
            <InputNumber min={1} max={5} step={0.05} className="w-full" />
          </Form.Item>
          <BenefitSwitch name="airportRideBonusEnabled" label="Airport Ride Bonus" />
          <BenefitSwitch name="scheduledRideBonusEnabled" label="Scheduled Ride Bonus" />
        </div>
      ),
    },
    {
      key: 'protection',
      label: 'Protection',
      children: (
        <div className="grid grid-cols-2 gap-3">
          <BenefitSwitch name="cancellationProtection" label="Cancellation Protection" />
          <BenefitSwitch name="disputePriority" label="Dispute Priority" />
          <Form.Item name={['benefits', 'customerSupportLevel']} label="Customer Support Level">
            <Select options={supportLevelOptions} />
          </Form.Item>
          <BenefitSwitch name="vipSupportAccess" label="VIP Support Access" />
        </div>
      ),
    },
    {
      key: 'performance',
      label: 'Performance',
      children: (
        <>
          <div className="mb-2 text-sm font-medium text-white">Performance Requirements</div>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name={['benefits', 'minimumAcceptanceRate']} label="Minimum Acceptance Rate (%)">
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>
            <Form.Item name={['benefits', 'minimumCompletionRate']} label="Minimum Completion Rate (%)">
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>
            <Form.Item name={['benefits', 'minimumDriverRating']} label="Minimum Driver Rating">
              <InputNumber min={0} max={5} step={0.01} className="w-full" />
            </Form.Item>
            <Form.Item name={['benefits', 'maximumComplaintThreshold']} label="Maximum Complaint Threshold">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </div>
          <div className="mb-2 mt-4 text-sm font-medium text-white">Qualification Requirements</div>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name={['requirements', 'completedTrips']} label="Completed Trips">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name={['requirements', 'driverRating']} label="Driver Rating">
              <InputNumber min={0} max={5} step={0.01} className="w-full" />
            </Form.Item>
            <Form.Item name={['requirements', 'acceptanceRate']} label="Acceptance Rate (%)">
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>
            <Form.Item name={['requirements', 'safetyScore']} label="Safety Score">
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>
          </div>
        </>
      ),
    },
    {
      key: 'promotions',
      label: 'Promotions',
      children: (
        <div className="grid grid-cols-2 gap-3">
          <BenefitSwitch name="promotionEligibility" label="Promotion Eligibility" />
          <BenefitSwitch name="campaignAccess" label="Campaign Access" />
          <BenefitSwitch name="specialEventBonuses" label="Special Event Bonuses" />
          <BenefitSwitch name="seasonalIncentives" label="Seasonal Incentives" />
        </div>
      ),
    },
  ]

  return (
    <Drawer
      title={title}
      open={open}
      width={720}
      onClose={onClose}
      destroyOnClose
      afterOpenChange={(visible) => {
        if (visible) form.setFieldsValue({ ...defaultValues, ...initialValues })
      }}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" loading={confirmLoading} onClick={() => form.submit()}>
            Save Tier
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onSubmit({
            ...values,
            benefits: syncBenefitFlags(values.benefits),
            requiredCompletionRate: values.benefits.minimumCompletionRate,
            requiredAcceptanceRate: values.benefits.minimumAcceptanceRate,
            requiredRating: values.benefits.minimumDriverRating,
          })
        }}
      >
        <Tabs items={tabItems} size="small" />
      </Form>
    </Drawer>
  )
}
