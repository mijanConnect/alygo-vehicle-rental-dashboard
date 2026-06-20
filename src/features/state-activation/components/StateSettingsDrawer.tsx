import { Button, Drawer, Form, Switch, Tag } from 'antd'
import { Save } from 'lucide-react'
import type { StateActivationRecord } from '@/types/stateActivation'
import { STATUS_LABELS } from '@/services/stateActivationApi'
import { statusTagColor } from '@/features/state-activation/stateActivationHelpers'

interface StateSettingsDrawerProps {
  open: boolean
  state: StateActivationRecord | null
  confirmLoading?: boolean
  onClose: () => void
  onSubmit: (values: Record<string, boolean>) => void
}

const settingFields = [
  { name: 'platformActive', label: 'Platform Active / Inactive', description: 'Master switch for platform availability in this state' },
  { name: 'driverRegistrationEnabled', label: 'Driver Registration', description: 'Allow new driver sign-ups' },
  { name: 'passengerRegistrationEnabled', label: 'Passenger Registration', description: 'Allow new passenger sign-ups' },
  { name: 'reservationsEnabled', label: 'Reservation Feature', description: 'Enable scheduled ride reservations' },
  { name: 'airportQueueEnabled', label: 'Airport Queue', description: 'Enable airport pickup queue operations' },
  { name: 'dynamicPricingEnabled', label: 'Dynamic Pricing', description: 'Enable surge and dynamic fare pricing' },
  { name: 'blackCategoryEnabled', label: 'Black Category', description: 'Enable Black ride category' },
  { name: 'blackSuvCategoryEnabled', label: 'Black SUV Category', description: 'Enable Black SUV ride category' },
] as const

export function StateSettingsDrawer({
  open,
  state,
  confirmLoading,
  onClose,
  onSubmit,
}: StateSettingsDrawerProps) {
  if (!state) return null

  return (
    <Drawer
      title={`State Settings — ${state.stateName}`}
      open={open}
      onClose={onClose}
      width={520}
      destroyOnClose
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            loading={confirmLoading}
            icon={<Save className="h-4 w-4" />}
            onClick={() => {
              document.getElementById('state-settings-form')?.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true }),
              )
            }}
          >
            Save Settings
          </Button>
        </div>
      }
    >
      <Tag color={statusTagColor(state.status)} className="mb-4">
        {STATUS_LABELS[state.status]}
      </Tag>

      <p className="mb-6 text-sm text-alygo-text-muted">
        Configure platform availability and feature toggles for {state.stateName}. Changes are logged in the audit trail.
      </p>

      <Form
        id="state-settings-form"
        layout="vertical"
        initialValues={{
          platformActive: state.platformActive,
          driverRegistrationEnabled: state.driverRegistrationEnabled,
          passengerRegistrationEnabled: state.passengerRegistrationEnabled,
          reservationsEnabled: state.reservationsEnabled,
          airportQueueEnabled: state.airportQueueEnabled,
          dynamicPricingEnabled: state.dynamicPricingEnabled,
          blackCategoryEnabled: state.blackCategoryEnabled,
          blackSuvCategoryEnabled: state.blackSuvCategoryEnabled,
        }}
        onFinish={onSubmit}
      >
        {settingFields.map(({ name, label, description }) => (
          <Form.Item
            key={name}
            name={name}
            label={label}
            valuePropName="checked"
            extra={<span className="text-xs text-alygo-text-muted">{description}</span>}
          >
            <Switch checkedChildren="ON" unCheckedChildren="OFF" />
          </Form.Item>
        ))}
        <button type="submit" className="hidden" />
      </Form>
    </Drawer>
  )
}
