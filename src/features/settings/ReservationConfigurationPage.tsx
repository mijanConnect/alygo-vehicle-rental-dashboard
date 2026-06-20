import { useState } from 'react'
import { Alert, Button, Form, Input, Switch } from 'antd'
import { PageShell } from '@/components/common/PageShell'
import { CreateReservationModal } from '@/features/reservations/components/CreateReservationModal'
import { usePermissions } from '@/hooks/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function ReservationConfigurationPage() {
  useDocumentTitle('Reservation Configuration')
  const { hasPermission } = usePermissions()
  const canCreateManual = hasPermission('reservations.create_manual')
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <PageShell
      title="Reservation Configuration"
      description="Operational reservation policies and advanced admin tools. Passenger bookings originate from mobile, web, airport, event, corporate, and API channels."
    >
      <div className="space-y-6">
        <div className="glass-card max-w-3xl p-6">
          <h3 className="text-base font-semibold text-white">Booking Channels</h3>
          <p className="mt-2 text-sm text-alygo-text-muted">
            Reservations are created by passenger-facing systems. The admin dashboard is for monitoring,
            assignment, and operational control — not primary booking intake.
          </p>
          <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-alygo-text-muted">
            <li>Passenger Mobile App</li>
            <li>Web Booking Portal</li>
            <li>Airport Booking Flow</li>
            <li>Event Booking Flow</li>
            <li>Corporate Booking System</li>
            <li>API Integrations</li>
          </ul>
        </div>

        <div className="glass-card max-w-3xl p-6">
          <h3 className="text-base font-semibold text-white">Operational Policies</h3>
          <Form layout="vertical" className="mt-4">
            <Form.Item label="Default Assignment Window (minutes)">
              <Input defaultValue="30" />
            </Form.Item>
            <Form.Item label="Auto-cancel Unassigned (hours before pickup)">
              <Input defaultValue="2" />
            </Form.Item>
            <Form.Item label="Allow Admin Status Overrides" valuePropName="checked">
              <Switch defaultChecked />
            </Form.Item>
            <Form.Item label="Notify Ops on Pending Assignments" valuePropName="checked">
              <Switch defaultChecked />
            </Form.Item>
          </Form>
        </div>

        {canCreateManual ? (
          <div className="glass-card max-w-3xl p-6">
            <h3 className="text-base font-semibold text-white">Manual Reservation Creation</h3>
            <p className="mt-2 text-sm text-alygo-text-muted">
              Restricted to Super Admin and Operations Manager roles. Use only for exceptional operational
              cases — VIP recovery, corporate escalations, or system backfill — not routine booking intake.
            </p>
            <Button type="default" className="mt-4" onClick={() => setCreateOpen(true)}>
              Create Manual Reservation
            </Button>
            <CreateReservationModal open={createOpen} onClose={() => setCreateOpen(false)} />
          </div>
        ) : (
          <Alert
            type="info"
            showIcon
            message="Manual reservation creation is restricted to Super Admin and Operations Manager roles."
          />
        )}
      </div>
    </PageShell>
  )
}
