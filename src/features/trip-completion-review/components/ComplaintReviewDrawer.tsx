import { Drawer, Spin, Table, Tag, Timeline } from 'antd'
import { useGetSingleTripReportQuery } from '@/redux/api/tripReportApi'
import { COMPLAINT_STATUS_LABELS } from '@/features/trip-completion-review/tripCompletionReviewHelpers'
import { formatCurrency, formatDateTime } from '@/utils/format'

interface ComplaintReviewDrawerProps {
  open: boolean
  complaintId: string | null
  onClose: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-alygo-text-muted">
        {title}
      </h4>
      {children}
    </div>
  )
}

export function ComplaintReviewDrawer({
  open,
  complaintId,
  onClose,
}: ComplaintReviewDrawerProps) {
  const { data, isLoading, isFetching } = useGetSingleTripReportQuery(complaintId ?? '', {
    skip: !open || !complaintId,
  })

  const ticketId = data?.complaint.ticketId ?? complaintId ?? ''

  return (
    <Drawer
      title={ticketId ? `Complaint ${ticketId}` : 'Complaint Details'}
      open={open}
      onClose={onClose}
      width={680}
      destroyOnClose
    >
      {(isLoading || isFetching) && (
        <div className="flex items-center justify-center py-16">
          <Spin />
        </div>
      )}

      {!isLoading && !isFetching && !data && (
        <p className="py-10 text-center text-alygo-text-muted">
          Complaint details not found.
        </p>
      )}

      {data && (
        <>
          <Tag className="mb-4">
            {COMPLAINT_STATUS_LABELS[data.complaint.status] ?? data.complaint.status}
          </Tag>

          <Section title="Passenger Report Review">
            <p className="text-sm text-white">
              {data.complaint.providedSummaryDetails || '—'}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <p>
                <span className="text-alygo-text-muted">Passenger:</span>{' '}
                {data.passenger?.name ?? '—'}
              </p>
              <p>
                <span className="text-alygo-text-muted">Driver:</span>{' '}
                {data.driver?.name ?? '—'}
              </p>
              <p>
                <span className="text-alygo-text-muted">Ticket:</span>{' '}
                {data.complaint.ticketId}
              </p>
              <p>
                <span className="text-alygo-text-muted">Reported:</span>{' '}
                {formatDateTime(data.complaint.createdAt)}
              </p>
              <p>
                <span className="text-alygo-text-muted">Passenger Email:</span>{' '}
                {data.passenger?.email ?? '—'}
              </p>
              <p>
                <span className="text-alygo-text-muted">Passenger Phone:</span>{' '}
                {data.passenger?.phone ?? '—'}
              </p>
              <p>
                <span className="text-alygo-text-muted">Est. Response:</span>{' '}
                {data.complaint.estimatedResponseTimeInMinutes} min
              </p>
            </div>
          </Section>

          <Section title="GPS Summary">
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-alygo-text-muted">Estimated Distance:</span>{' '}
                {data.gpsSummary.estimatedDistanceMeters}m
              </p>
              <p>
                <span className="text-alygo-text-muted">Actual Distance:</span>{' '}
                {data.gpsSummary.actualDistanceMeters}m
              </p>
              <p>
                <span className="text-alygo-text-muted">Distance Delta:</span>{' '}
                {data.gpsSummary.distanceDeltaMeters}m
              </p>
            </div>
          </Section>

          <Section title="Fare Calculation Breakdown">
            <Table
              size="small"
              pagination={false}
              rowKey="label"
              dataSource={[
                { label: 'Base Fare', amount: data.fareBreakdown.baseFare },
                { label: 'Distance Fare', amount: data.fareBreakdown.distanceFare },
                { label: 'Time Fare', amount: data.fareBreakdown.timeFare },
                { label: 'Subtotal', amount: data.fareBreakdown.subtotal },
                { label: 'Commission', amount: data.fareBreakdown.commission },
                { label: 'Driver Earning', amount: data.fareBreakdown.driverEarning },
              ]}
              columns={[
                { title: 'Line Item', dataIndex: 'label' },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  render: (a: number) => formatCurrency(a),
                },
              ]}
              footer={() => (
                <div className="flex justify-between font-semibold text-white">
                  <span>Total</span>
                  <span>{formatCurrency(data.fareBreakdown.total)}</span>
                </div>
              )}
            />
          </Section>

          {data.refund && (
            <Section title="Refund">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-alygo-text-muted">Amount:</span>{' '}
                  {formatCurrency(data.refund.amount ?? 0)}
                </p>
                <p>
                  <span className="text-alygo-text-muted">Status:</span>{' '}
                  {data.refund.status ?? '—'}
                </p>
              </div>
            </Section>
          )}

          <Section title="Timeline">
            <Timeline
              items={(data.timeline ?? []).map((event) => ({
                children: (
                  <div>
                    <p className="font-medium text-white">{event.event}</p>
                    <p className="text-xs text-alygo-text-muted">
                      {formatDateTime(event.timestamp)} — {event.actor}
                    </p>
                    {event.details?.issue != null && (
                      <p className="mt-1 text-sm text-alygo-text-muted">
                        Issue: {String(event.details.issue)}
                      </p>
                    )}
                    {event.details?.details != null && (
                      <p className="text-sm text-white">
                        {String(event.details.details)}
                      </p>
                    )}
                  </div>
                ),
              }))}
            />
          </Section>

          {(data.adminNotes?.length ?? 0) > 0 && (
            <Section title="Admin Notes">
              <Table
                size="small"
                pagination={false}
                rowKey={(_, index) => String(index)}
                dataSource={data.adminNotes}
                columns={[
                  {
                    title: 'Note',
                    dataIndex: 'note',
                    ellipsis: true,
                    render: (note?: string) => note || '—',
                  },
                  {
                    title: 'Admin',
                    dataIndex: 'admin',
                    render: (admin?: string) => admin || '—',
                  },
                  {
                    title: 'Time',
                    render: (_, row) =>
                      row.createdAt || row.timestamp
                        ? formatDateTime(row.createdAt || row.timestamp || '')
                        : '—',
                  },
                ]}
              />
            </Section>
          )}
        </>
      )}
    </Drawer>
  )
}
