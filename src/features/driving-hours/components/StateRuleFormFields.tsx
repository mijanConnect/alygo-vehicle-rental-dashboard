import { Form, Input, InputNumber, Select } from 'antd'
import { DRIVER_LEVEL_OPTIONS, US_STATE_OPTIONS } from '@/services/mock/drivingHoursData'
import type { StateDrivingRule } from '@/types/drivingHours'

interface StateRuleFormFieldsProps {
  isCreate?: boolean
}

export function StateRuleFormFields({ isCreate }: StateRuleFormFieldsProps) {
  return (
    <>
      {isCreate && (
        <Form.Item name="state" label="State Name" rules={[{ required: true }]}>
          <Select showSearch placeholder="Select state" options={US_STATE_OPTIONS} />
        </Form.Item>
      )}
      <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-4">
        <Form.Item name="maxDrivingHours" label="Maximum Driving Hours" rules={[{ required: true }]}>
          <InputNumber min={1} max={24} className="w-full" addonAfter="hours" />
        </Form.Item>
        <Form.Item name="requiredResetHours" label="Required Reset Hours" rules={[{ required: true }]}>
          <InputNumber min={1} max={24} className="w-full" addonAfter="hours" />
        </Form.Item>
        <Form.Item name="warningThresholdHours" label="Warning Threshold" rules={[{ required: true }]}>
          <InputNumber min={1} max={24} className="w-full" addonAfter="hours" />
        </Form.Item>
        <Form.Item name="dailyDrivingLimit" label="Daily Driving Limit" rules={[{ required: true }]}>
          <InputNumber min={1} max={24} className="w-full" addonAfter="hours" />
        </Form.Item>
        <Form.Item name="weeklyDrivingLimit" label="Weekly Driving Limit" rules={[{ required: true }]}>
          <InputNumber min={1} max={168} className="w-full" addonAfter="hours" />
        </Form.Item>
        <Form.Item name="mandatoryBreakDuration" label="Mandatory Break Duration" rules={[{ required: true }]}>
          <InputNumber min={5} max={120} className="w-full" addonAfter="min" />
        </Form.Item>
        <Form.Item name="breakTriggerThreshold" label="Break Trigger Threshold" rules={[{ required: true }]}>
          <InputNumber min={1} max={12} className="w-full" addonAfter="hours" />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
        </Form.Item>
      </div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-alygo-text-muted">Violation Penalty Settings</p>
      <Form.Item name={['violationPenaltySettings', 'firstOffense']} label="First Offense" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name={['violationPenaltySettings', 'secondOffense']} label="Second Offense" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name={['violationPenaltySettings', 'thirdOffense']} label="Third Offense" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name={['violationPenaltySettings', 'autoSuspendAfter']} label="Auto-Suspend After" rules={[{ required: true }]}>
        <InputNumber min={1} max={10} className="w-full" addonAfter="violations" />
      </Form.Item>
      <Form.Item name="driverLevelExceptions" label="Driver Level Exceptions" extra="Select levels that receive hour limit exceptions">
        <Select mode="multiple" options={DRIVER_LEVEL_OPTIONS} />
      </Form.Item>
    </>
  )
}

export function defaultStateRuleValues(): Partial<StateDrivingRule> {
  return {
    maxDrivingHours: 12,
    requiredResetHours: 8,
    warningThresholdHours: 10,
    dailyDrivingLimit: 12,
    weeklyDrivingLimit: 60,
    mandatoryBreakDuration: 30,
    breakTriggerThreshold: 6,
    violationPenaltySettings: {
      firstOffense: 'Warning notification',
      secondOffense: 'Temporary suspension (24h)',
      thirdOffense: 'Account review and restriction',
      autoSuspendAfter: 3,
    },
    driverLevelExceptions: [],
    status: 'active',
  }
}

function levelsToOverrides(levels: string[] | undefined) {
  return (levels ?? []).map((level) => ({ level }))
}

export function normalizeStateFormValues(values: Record<string, unknown>) {
  const exceptions = values.driverLevelExceptions
  return {
    ...values,
    driverLevelExceptions: Array.isArray(exceptions) && typeof exceptions[0] === 'string'
      ? levelsToOverrides(exceptions as string[])
      : exceptions,
  }
}

export function formValuesFromStateRule(record: { driverLevelExceptions: { level: string }[] }) {
  return {
    ...record,
    driverLevelExceptions: record.driverLevelExceptions.map((e) => e.level),
  }
}
