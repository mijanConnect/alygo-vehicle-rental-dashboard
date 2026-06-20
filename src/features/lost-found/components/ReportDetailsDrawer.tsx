import { Drawer, Image, Tag, Timeline } from 'antd'
import { Star } from 'lucide-react'
import type { LostItemReport } from '@/types/lostFound'

const statusLabels: Record<string, string> = {
  pending_review: 'Pending Review',
  found: 'Found',
  not_found: 'Not Found',
  pickup_scheduled: 'Pickup Scheduled',
  delivery_scheduled: 'Delivery Scheduled',
  completed: 'Completed',
  closed: 'Closed',
}

interface ReportDetailsDrawerProps {
  open: boolean
  report: LostItemReport | null
  onClose: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-alygo-text-muted">{title}</h4>
      <div className="space-y-2 text-sm text-white">{children}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <span className="min-w-[120px] text-alygo-text-muted">{label}</span>
      <span className="flex-1">{value}</span>
    </div>
  )
}

export function ReportDetailsDrawer({ open, report, onClose }: ReportDetailsDrawerProps) {
  if (!report) return null

  return (
    <Drawer
      title={`Report ${report.id}`}
      open={open}
      onClose={onClose}
      width={560}
      destroyOnClose
    >
      <Tag className="mb-4">{statusLabels[report.status] ?? report.status}</Tag>

      <Section title="Passenger Information">
        <Field label="Name" value={report.passengerName} />
        <Field label="Email" value={report.passengerEmail} />
        <Field label="Phone" value={report.passengerPhone} />
      </Section>

      <Section title="Driver Information">
        <Field label="Name" value={report.driverName} />
        <Field label="Driver ID" value={report.driverId} />
        <Field
          label="Rating"
          value={
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {report.driverRating.toFixed(2)}
            </span>
          }
        />
      </Section>

      <Section title="Trip Information">
        <Field label="Trip ID" value={report.tripId} />
        <Field label="Pickup" value={report.pickup} />
        <Field label="Destination" value={report.destination} />
        <Field label="Trip Date" value={new Date(report.tripDate).toLocaleString()} />
      </Section>

      <Section title="Lost Item Information">
        <Field label="Item Category" value={report.itemCategory} />
        <Field label="Item Name" value={report.itemName} />
        <Field label="Description" value={report.itemDescription} />
        {report.photos.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-alygo-text-muted">Uploaded Photos</p>
            <div className="flex flex-wrap gap-2">
              {report.photos.map((photo, index) => (
                <div
                  key={index}
                  className="flex h-20 w-20 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs text-alygo-text-muted"
                >
                  <Image
                    src={photo}
                    alt={`Item photo ${index + 1}`}
                    fallback="Photo"
                    className="rounded-lg"
                    width={80}
                    height={80}
                    preview={{ mask: 'View' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {report.assignedAdmin && (
        <Section title="Assignment">
          <Field label="Assigned Admin" value={report.assignedAdmin} />
        </Section>
      )}

      <Section title="Case Timeline">
        <Timeline
          items={report.timeline.map((event) => ({
            children: (
              <div>
                <p className="font-medium text-white">{event.label}</p>
                <p className="text-alygo-text-muted">{event.description}</p>
                <p className="mt-1 text-xs text-alygo-text-muted">
                  {new Date(event.timestamp).toLocaleString()} · {event.actor}
                </p>
              </div>
            ),
          }))}
        />
      </Section>
    </Drawer>
  )
}
