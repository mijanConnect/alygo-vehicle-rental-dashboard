import { Drawer, Table, Tag, Timeline } from 'antd'
import { MapPin, Navigation } from 'lucide-react'
import type { TripCompletionComplaint } from '@/types/tripCompletionReview'
import { COMPLAINT_STATUS_LABELS } from '@/features/trip-completion-review/tripCompletionReviewHelpers'
import { formatCurrency, formatNumber } from '@/utils/format'

interface ComplaintReviewDrawerProps {
  open: boolean
  complaint: TripCompletionComplaint | null
  onClose: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-alygo-text-muted">{title}</h4>
      {children}
    </div>
  )
}

export function ComplaintReviewDrawer({ open, complaint, onClose }: ComplaintReviewDrawerProps) {
  if (!complaint) return null

  return (
    <Drawer
      title={`Complaint ${complaint.id}`}
      open={open}
      onClose={onClose}
      width={680}
      destroyOnClose
    >
      <Tag className="mb-4">{COMPLAINT_STATUS_LABELS[complaint.status]}</Tag>
      <Tag className="mb-4 ml-2">{complaint.complaintType}</Tag>

      <Section title="Passenger Report Review">
        <p className="text-sm text-white">{complaint.description}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <p><span className="text-alygo-text-muted">Passenger:</span> {complaint.passengerName}</p>
          <p><span className="text-alygo-text-muted">Driver:</span> {complaint.driverName}</p>
          <p><span className="text-alygo-text-muted">Trip ID:</span> {complaint.tripId}</p>
          <p><span className="text-alygo-text-muted">Reported:</span> {new Date(complaint.reportedAt).toLocaleString()}</p>
        </div>
      </Section>

      <Section title="GPS Route Timeline">
        <Timeline
          items={complaint.routeTimeline.map((point) => ({
            dot: point.label === 'Driver End Trip' ? <Navigation className="h-3 w-3 text-amber-400" /> : <MapPin className="h-3 w-3 text-indigo-400" />,
            children: (
              <div>
                <p className="font-medium text-white">{point.label}</p>
                <p className="text-xs text-alygo-text-muted">
                  {new Date(point.timestamp).toLocaleString()} — {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                </p>
              </div>
            ),
          }))}
        />
      </Section>

      <Section title="Dropoff Locations">
        <div className="space-y-2 text-sm">
          <p><span className="text-alygo-text-muted">Actual Dropoff:</span> {complaint.actualDropoffLocation}</p>
          <p><span className="text-alygo-text-muted">Driver End Trip:</span> {complaint.driverEndTripLocation}</p>
          <p><span className="text-alygo-text-muted">Distance Delta:</span> {complaint.distanceDeltaMeters}m</p>
        </div>
      </Section>

      <Section title="Trip Duration & Mileage">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/5 p-3">
            <p className="text-alygo-text-muted text-sm">Trip Duration</p>
            <p className="text-lg font-semibold text-white">{complaint.tripDurationMinutes} min</p>
          </div>
          <div className="rounded-lg border border-white/5 p-3">
            <p className="text-alygo-text-muted text-sm">Mileage</p>
            <p className="text-lg font-semibold text-white">{formatNumber(complaint.tripMileage)} mi</p>
          </div>
        </div>
      </Section>

      <Section title="Fare Calculation Breakdown">
        <Table
          size="small"
          pagination={false}
          rowKey="label"
          dataSource={complaint.fareBreakdown}
          columns={[
            { title: 'Line Item', dataIndex: 'label' },
            { title: 'Amount', dataIndex: 'amount', render: (a: number) => formatCurrency(a) },
          ]}
          footer={() => (
            <div className="flex justify-between font-semibold text-white">
              <span>Total</span>
              <span>{formatCurrency(complaint.fareTotal)}</span>
            </div>
          )}
        />
      </Section>

      <Section title="Route History">
        <Timeline
          items={complaint.routeHistory.map((e) => ({
            children: (
              <div>
                <p className="text-white">{e.event}</p>
                <p className="text-xs text-alygo-text-muted">{new Date(e.timestamp).toLocaleString()}</p>
              </div>
            ),
          }))}
        />
      </Section>

      {complaint.auditLog.length > 0 && (
        <Section title="Audit Log">
          <Table
            size="small"
            pagination={false}
            rowKey={(_, i) => String(i)}
            dataSource={complaint.auditLog}
            columns={[
              { title: 'Action', dataIndex: 'action' },
              { title: 'Admin', dataIndex: 'admin' },
              { title: 'Notes', dataIndex: 'notes', ellipsis: true },
              { title: 'Time', dataIndex: 'timestamp', render: (d: string) => new Date(d).toLocaleString() },
            ]}
          />
        </Section>
      )}
    </Drawer>
  )
}
