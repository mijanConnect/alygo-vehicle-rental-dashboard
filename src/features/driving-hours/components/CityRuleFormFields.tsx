import { Form, Input, InputNumber, Select } from 'antd'
import { DRIVER_LEVEL_OPTIONS, US_STATE_OPTIONS } from '@/services/mock/drivingHoursData'
import type { CityDrivingRule } from '@/types/drivingHours'

interface CityRuleFormFieldsProps {
  isCreate?: boolean
  stateOptions?: { value: string; label: string }[]
}

export function CityRuleFormFields({ isCreate, stateOptions }: CityRuleFormFieldsProps) {
  return (
    <>
      {isCreate && (
        <>
          <Form.Item name="city" label="City Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. San Francisco" />
          </Form.Item>
          <Form.Item name="state" label="State Name" rules={[{ required: true }]}>
            <Select showSearch placeholder="Select state" options={stateOptions ?? US_STATE_OPTIONS} />
          </Form.Item>
        </>
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
      <Form.Item name="driverLevelOverrides" label="Driver Level Overrides" extra="Levels with custom hour limits in this city">
        <Select mode="multiple" options={DRIVER_LEVEL_OPTIONS} />
      </Form.Item>
    </>
  )
}

export function defaultCityRuleValues(): Partial<CityDrivingRule> {
  return {
    maxDrivingHours: 12,
    requiredResetHours: 8,
    warningThresholdHours: 10,
    dailyDrivingLimit: 12,
    weeklyDrivingLimit: 60,
    mandatoryBreakDuration: 30,
    breakTriggerThreshold: 6,
    driverLevelOverrides: [],
    status: 'active',
    inheritanceSource: 'custom',
  }
}

function levelsToOverrides(levels: string[] | undefined) {
  return (levels ?? []).map((level) => ({ level }))
}

export function normalizeCityFormValues(values: Record<string, unknown>) {
  const overrides = values.driverLevelOverrides
  return {
    ...values,
    driverLevelOverrides: Array.isArray(overrides) && typeof overrides[0] === 'string'
      ? levelsToOverrides(overrides as string[])
      : overrides,
  }
}

export function formValuesFromCityRule(record: { driverLevelOverrides: { level: string }[] }) {
  return {
    ...record,
    driverLevelOverrides: record.driverLevelOverrides.map((o) => o.level),
  }
}
