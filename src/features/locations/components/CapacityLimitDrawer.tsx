import { useEffect } from 'react'
import { Button, Drawer, Form, InputNumber, Switch, Divider, Typography } from 'antd'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useUpdateCapacityLimitMutation } from '@/services/capacityLimitsApi'
import type { CapacityLimit } from '@/types/capacityLimits'

const { Text } = Typography

interface CapacityLimitDrawerProps {
  limit: CapacityLimit | null
  open: boolean
  onClose: () => void
}

export function CapacityLimitDrawer({ limit, open, onClose }: CapacityLimitDrawerProps) {
  const [form] = Form.useForm()
  const adminActions = useAdminActions()
  const [updateLimit, { isLoading }] = useUpdateCapacityLimitMutation()

  useEffect(() => {
    if (limit && open) {
      form.setFieldsValue(limit)
    } else {
      form.resetFields()
    }
  }, [limit, open, form])

  const onFinish = async (values: any) => {
    if (!limit) return
    try {
      await updateLimit({ id: limit.id, settings: values }).unwrap()
      adminActions.notify(`${limit.locationName} limits updated successfully`)
      onClose()
    } catch (e) {
      adminActions.notify('Failed to update limits', 'error')
    }
  }

  if (!limit) return null

  return (
    <Drawer
      title={`Edit Capacity Limits - ${limit.locationName}`}
      open={open}
      onClose={onClose}
      width={480}
      extra={
        <div className="flex gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" loading={isLoading} onClick={() => form.submit()}>
            Save
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Divider orientation="left">General Limits</Divider>
        <Form.Item label="Maximum Active Drivers" name="maxActiveDrivers" rules={[{ required: true }]}>
          <InputNumber className="w-full" min={0} />
        </Form.Item>
        <Form.Item label="Maximum New Approvals" name="maxNewApprovals" rules={[{ required: true }]}>
          <InputNumber className="w-full" min={0} />
        </Form.Item>
        <Form.Item
          label="Pause Onboarding"
          name="onboardingPaused"
          valuePropName="checked"
          tooltip="Automatically stops accepting new drivers for this location."
        >
          <Switch />
        </Form.Item>

        {['zone', 'airport'].includes(limit.locationType) && (
          <>
            <Divider orientation="left">Supply & Queue Settings</Divider>
            <Form.Item label="Minimum Driver Supply" name="minDriverSupply">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
            <Form.Item label="Maximum Driver Supply" name="maxDriverSupply">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
            {limit.locationType === 'airport' && (
              <Form.Item label="Max Airport Queue Size" name="maxAirportQueueSize">
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            )}
            <Form.Item
              label="Automatic Waiting Queue"
              name="autoWaitingQueue"
              valuePropName="checked"
              tooltip="When capacity is reached, new drivers are placed in a waiting queue with a 'Zone Full' message."
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="Auto-move from Waitlist"
              name="autoMoveFromWaitlist"
              valuePropName="checked"
              tooltip="Automatically moves drivers from waitlist to active status when space becomes available."
            >
              <Switch />
            </Form.Item>
          </>
        )}

        <Divider orientation="left">Admin Notifications</Divider>
        <Text type="secondary" className="block mb-4 text-sm">
          Notify admin when active drivers reach the following capacity thresholds:
        </Text>
        <Form.Item label="Notify at 80% Capacity" name="notifyAt80" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item label="Notify at 90% Capacity" name="notifyAt90" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item label="Notify at 100% Capacity" name="notifyAt100" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Drawer>
  )
}
