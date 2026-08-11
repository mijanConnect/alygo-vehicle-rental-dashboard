import { Drawer, Empty, Image, Spin, Tag, Timeline } from 'antd'
import { Star } from 'lucide-react'
import {
  useGetSingleLostAndFoundReportQuery,
} from '@/redux/api/lostandfound/lostAndFoundApi'
import { REPORT_STATUS_LABELS } from '@/features/lost-found/lostFoundHelpers'

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') ?? ''

function resolveAssetUrl(path?: string | null) {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

interface ReportDetailsDrawerProps {
  open: boolean
  reportId: string | null
  onClose: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-alygo-text-muted">
        {title}
      </h4>
      <div className="space-y-2 text-sm text-white">{children}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <span className="min-w-[120px] text-alygo-text-muted">{label}</span>
      <span className="flex-1">{value || '—'}</span>
    </div>
  )
}

export function ReportDetailsDrawer({ open, reportId, onClose }: ReportDetailsDrawerProps) {
  const { data, isLoading, isError, isFetching } = useGetSingleLostAndFoundReportQuery(
    reportId ?? '',
    { skip: !open || !reportId },
  )

  return (
    <Drawer
      title={data ? `Report ${data.reportNumber}` : 'Report Details'}
      open={open}
      onClose={onClose}
      width={560}
      destroyOnClose
    >
      {isLoading || isFetching ? (
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      ) : isError || !data ? (
        <Empty description="Unable to load report details" />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Tag>
              {REPORT_STATUS_LABELS[data.status] ?? data.status.replace(/_/g, ' ')}
            </Tag>
            <span className="text-xs text-alygo-text-muted">{data.createdAt}</span>
          </div>

          <Section title="Passenger Information">
            {data.passenger ? (
              <>
                <Field label="Name" value={data.passenger.fullName} />
                <Field label="Email" value={data.passenger.email} />
                <Field label="Phone" value={data.passenger.phone} />
                <Field label="Passenger ID" value={data.passenger.id} />
              </>
            ) : (
              <Empty description="Passenger unavailable" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Section>

          <Section title="Driver Information">
            {data.driver ? (
              <>
                <Field label="Name" value={data.driver.fullName} />
                <Field label="Driver ID" value={data.driver.driverCode} />
                <Field
                  label="Rating"
                  value={
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {data.driver.rating.toFixed(2)}
                    </span>
                  }
                />
              </>
            ) : (
              <Empty description="Driver unavailable" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Section>

          <Section title="Trip Information">
            {data.trip ? (
              <>
                <Field label="Ride ID" value={data.trip.rideId} />
                <Field label="Booking Ref" value={data.trip.bookingReference} />
                <Field label="Pickup" value={data.trip.pickupAddress} />
                <Field label="Destination" value={data.trip.destinationAddress} />
                <Field label="Trip Date" value={data.trip.tripDate} />
              </>
            ) : (
              <Empty description="Trip unavailable" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Section>

          <Section title="Lost Item Information">
            {data.lostItem ? (
              <>
                <Field label="Item Category" value={data.lostItem.category} />
                <Field label="Item Name" value={data.lostItem.itemName} />
                <Field label="Description" value={data.lostItem.description} />
                {data.lostItem.photos.length > 0 ? (
                  <div className="mt-3">
                    <p className="mb-2 text-alygo-text-muted">Uploaded Photos</p>
                    <div className="flex flex-wrap gap-2">
                      {data.lostItem.photos.map((photo, index) => {
                        const src = resolveAssetUrl(photo.url)
                        return (
                          <div
                            key={photo.id || index}
                            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 text-xs text-alygo-text-muted"
                          >
                            {src ? (
                              <Image
                                src={src}
                                alt={`Item photo ${index + 1}`}
                                width={80}
                                height={80}
                                className="rounded-lg object-cover"
                                preview={{ mask: 'View' }}
                              />
                            ) : (
                              'Photo'
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <Empty description="Item details unavailable" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Section>

          <Section title="Case Timeline">
            {data.timeline.length > 0 ? (
              <Timeline
                items={data.timeline.map((event, index) => ({
                  color: event.status === 'completed' ? 'green' : 'blue',
                  children: (
                    <div key={`${event.title}-${index}`}>
                      <p className="font-medium text-white">{event.title}</p>
                      <p className="text-alygo-text-muted">{event.description}</p>
                      <p className="mt-1 text-xs text-alygo-text-muted">{event.createdAt}</p>
                    </div>
                  ),
                }))}
              />
            ) : (
              <Empty description="No timeline events" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Section>
        </>
      )}
    </Drawer>
  )
}
