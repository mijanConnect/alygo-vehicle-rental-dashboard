import { useEffect } from 'react'
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Spin,
  Switch,
  Tabs,
  TimePicker,
} from 'antd'
import dayjs from 'dayjs'
import { AdminActionHost } from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { TimezoneSelect } from '@/components/shared/TimezoneSelect'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  toSystemConfigWritePayload,
  useGetSystemConfigrationQuery,
  useUpdateSystemConfigrationMutation,
  type SystemConfigrationWritePayload,
} from '@/redux/api/systemConfigrationApi'

const CURRENCY_OPTIONS = [
  { label: 'USD', value: 'USD' },
  { label: 'CAD', value: 'CAD' },
  { label: 'BDT', value: 'BDT' },
]

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-white/10 p-4">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description ? (
        <p className="mt-1 mb-4 text-sm text-alygo-text-muted">{description}</p>
      ) : (
        <div className="mb-4" />
      )}
      <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">{children}</div>
    </div>
  )
}

export default function SystemConfigurationPage() {
  useDocumentTitle('System Configuration')
  const adminActions = useAdminActions()
  const [form] = Form.useForm<SystemConfigrationWritePayload>()
  const { data, isLoading, isFetching, isError } = useGetSystemConfigrationQuery()
  const [updateConfig, { isLoading: saving }] = useUpdateSystemConfigrationMutation()

  useEffect(() => {
    form.setFieldsValue(toSystemConfigWritePayload(isError ? undefined : data))
  }, [data, isError, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const payload = toSystemConfigWritePayload(values)
      await updateConfig(payload).unwrap()
      adminActions.notify('System configuration saved')
    } catch {
      adminActions.notify('Unable to save system configuration')
    }
  }

  return (
    <PageShell
      title="System Configuration"
      description="Manage driver matching, tracking, reservations, lost & found, referrals, and rewards defaults."
      actions={
        <Button type="primary" onClick={handleSave} loading={saving} disabled={isLoading || isFetching}>
          Save Changes
        </Button>
      }
    >
      <div className="glass-card p-4 md:p-6">
        {isLoading || isFetching ? (
          <div className="flex justify-center py-16">
            <Spin />
          </div>
        ) : (
          <Form form={form} layout="vertical" className="system-config-form">
            <Tabs
              items={[
                {
                  key: 'driverMatching',
                  label: 'Driver Matching',
                  children: (
                    <SectionCard
                      title="Driver Matching"
                      description="Search radius and ride request timing for driver matching."
                    >
                      <Form.Item
                        name={['driverMatching', 'initialSearchRadiusKm']}
                        label="Initial Search Radius (km)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['driverMatching', 'radiusExpansionDistanceKm']}
                        label="Radius Expansion Distance (km)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['driverMatching', 'maxSearchRadiusKm']}
                        label="Max Search Radius (km)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['driverMatching', 'driverVisibilityDurationSeconds']}
                        label="Driver Visibility Duration (sec)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['driverMatching', 'rideRequestLifetimeSeconds']}
                        label="Ride Request Lifetime (sec)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                    </SectionCard>
                  ),
                },
                {
                  key: 'tracking',
                  label: 'Tracking',
                  children: (
                    <SectionCard
                      title="Tracking"
                      description="Location update and ETA calculation settings."
                    >
                      <Form.Item
                        name={['tracking', 'minLocationUpdateIntervalSeconds']}
                        label="Min Location Update Interval (sec)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['tracking', 'minMovementDistanceMeters']}
                        label="Min Movement Distance (m)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['tracking', 'maxGpsAccuracyToleranceMeters']}
                        label="Max GPS Accuracy Tolerance (m)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['tracking', 'arrivalRadiusMeters']}
                        label="Arrival Radius (m)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['tracking', 'etaRefreshIntervalSeconds']}
                        label="ETA Refresh Interval (sec)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['tracking', 'averageSpeedKmh']}
                        label="Average Speed (km/h)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['tracking', 'enableSocketOptimization']}
                        label="Enable Socket Optimization"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </SectionCard>
                  ),
                },
                {
                  key: 'reservation',
                  label: 'Reservation',
                  children: (
                    <SectionCard
                      title="Reservation"
                      description="Advance booking windows and reminder settings."
                    >
                      <Form.Item
                        name={['reservation', 'enabled']}
                        label="Enabled"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item
                        name={['reservation', 'minAdvanceMinutes']}
                        label="Min Advance (minutes)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['reservation', 'maxAdvanceDays']}
                        label="Max Advance (days)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['reservation', 'driverVisibleBeforeMinutes']}
                        label="Driver Visible Before (minutes)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['reservation', 'driverAssignmentTimeoutMinutes']}
                        label="Driver Assignment Timeout (minutes)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['reservation', 'reminder24h']}
                        label="Reminder 24h"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item
                        name={['reservation', 'reminder1h']}
                        label="Reminder 1h"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item
                        name={['reservation', 'reminder30m']}
                        label="Reminder 30m"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item
                        name={['reservation', 'reminder15m']}
                        label="Reminder 15m"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </SectionCard>
                  ),
                },
                {
                  key: 'lostFound',
                  label: 'Lost & Found',
                  children: (
                    <SectionCard
                      title="Lost & Found"
                      description="Reporting windows, file limits, and return settings."
                    >
                      <Form.Item
                        name={['lostFound', 'enabled']}
                        label="Enabled"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item
                        name={['lostFound', 'reportWindowDays']}
                        label="Report Window (days)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['lostFound', 'maxFiles']}
                        label="Max Files"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['lostFound', 'maxFileSizeMb']}
                        label="Max File Size (MB)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['lostFound', 'defaultDeliveryFee']}
                        label="Default Delivery Fee"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['lostFound', 'returnConfirmationHours']}
                        label="Return Confirmation (hours)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['lostFound', 'autoCloseDays']}
                        label="Auto Close (days)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                    </SectionCard>
                  ),
                },
                {
                  key: 'referral',
                  label: 'Referral',
                  children: (
                    <div className="space-y-4">
                      <SectionCard title="Passenger Referral">
                        <Form.Item
                          name={['referral', 'passenger', 'enabled']}
                          label="Enabled"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'passenger', 'rewardAmount']}
                          label="Reward Amount"
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={0} className="!w-full" />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'passenger', 'rewardCurrency']}
                          label="Currency"
                          rules={[{ required: true }]}
                        >
                          <Select options={CURRENCY_OPTIONS} />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'passenger', 'qualificationType']}
                          label="Qualification Type"
                          rules={[{ required: true }]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'passenger', 'requiredCompletedTrips']}
                          label="Required Completed Trips"
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={0} className="!w-full" />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'passenger', 'qualificationDays']}
                          label="Qualification Days"
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={0} className="!w-full" />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'passenger', 'maximumRewardsPerUser']}
                          label="Max Rewards Per User"
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={0} className="!w-full" />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'passenger', 'allowMultipleRewards']}
                          label="Allow Multiple Rewards"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'passenger', 'autoRewardEnabled']}
                          label="Auto Reward Enabled"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'passenger', 'shareInstructions']}
                          label="Share Instructions"
                          className="md:col-span-2"
                        >
                          <Input.TextArea rows={2} />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'passenger', 'rewardTerms']}
                          label="Reward Terms"
                          className="md:col-span-2"
                        >
                          <Input.TextArea rows={2} />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'passenger', 'generalNotes']}
                          label="General Notes"
                          className="md:col-span-2"
                        >
                          <Input.TextArea rows={2} />
                        </Form.Item>
                      </SectionCard>

                      <SectionCard title="Driver Referral">
                        <Form.Item
                          name={['referral', 'driver', 'enabled']}
                          label="Enabled"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'driver', 'rewardAmount']}
                          label="Reward Amount"
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={0} className="!w-full" />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'driver', 'rewardCurrency']}
                          label="Currency"
                          rules={[{ required: true }]}
                        >
                          <Select options={CURRENCY_OPTIONS} />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'driver', 'requiredCompletedTrips']}
                          label="Required Completed Trips"
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={0} className="!w-full" />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'driver', 'qualificationDays']}
                          label="Qualification Days"
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={0} className="!w-full" />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'driver', 'payoutDelayHours']}
                          label="Payout Delay (hours)"
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={0} className="!w-full" />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'driver', 'maximumRewardsPerDriver']}
                          label="Max Rewards Per Driver"
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={0} className="!w-full" />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'driver', 'autoRewardEnabled']}
                          label="Auto Reward Enabled"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'driver', 'shareInstructions']}
                          label="Share Instructions"
                          className="md:col-span-2"
                        >
                          <Input.TextArea rows={2} />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'driver', 'termsAndConditions']}
                          label="Terms and Conditions"
                          className="md:col-span-2"
                        >
                          <Input.TextArea rows={2} />
                        </Form.Item>
                        <Form.Item
                          name={['referral', 'driver', 'generalNotes']}
                          label="General Notes"
                          className="md:col-span-2"
                        >
                          <Input.TextArea rows={2} />
                        </Form.Item>
                      </SectionCard>
                    </div>
                  ),
                },
                {
                  key: 'driverRewards',
                  label: 'Driver Rewards',
                  children: (
                    <SectionCard
                      title="Driver Rewards"
                      description="Tier promotion, quota reset, and destination filter defaults."
                    >
                      <Form.Item
                        name={['driverRewards', 'enabled']}
                        label="Enabled"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item
                        name={['driverRewards', 'tierPromotion']}
                        label="Tier Promotion"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item
                        name={['driverRewards', 'autoDowngrade']}
                        label="Auto Downgrade"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <Form.Item
                        name={['driverRewards', 'destinationFilterRadiusDefault']}
                        label="Destination Filter Radius Default (km)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0} className="!w-full" />
                      </Form.Item>
                      <Form.Item
                        name={['driverRewards', 'timezone']}
                        label="Timezone"
                        rules={[{ required: true }]}
                      >
                        <TimezoneSelect allowClear={false} />
                      </Form.Item>
                      <Form.Item
                        name={['driverRewards', 'dailyQuotaResetTime']}
                        label="Daily Quota Reset Time"
                        rules={[{ required: true }]}
                        getValueProps={(value?: string) => ({
                          value: value ? dayjs(value, 'HH:mm') : undefined,
                        })}
                        getValueFromEvent={(value) =>
                          value ? dayjs(value).format('HH:mm') : '00:00'
                        }
                      >
                        <TimePicker format="HH:mm" className="!w-full" minuteStep={5} />
                      </Form.Item>
                    </SectionCard>
                  ),
                },
              ]}
            />
          </Form>
        )}
      </div>
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
