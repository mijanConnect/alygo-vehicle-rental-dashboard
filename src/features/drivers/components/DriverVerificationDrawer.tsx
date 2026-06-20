import { useEffect, useRef, useState } from 'react'
import {
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  Select,
  Switch,
  Table,
  Tag,
  message,
} from 'antd'
import { CheckCircle, Shield, XCircle } from 'lucide-react'
import type { Driver } from '@/types'
import type { DriverVerificationFocus } from '@/features/drivers/driverVerificationHelpers'
import { IdentityVerificationBadge } from '@/features/drivers/components/IdentityVerificationBadge'
import { PhotoCompareView } from '@/features/drivers/components/PhotoCompareView'
import { identityStatusLabel } from '@/features/drivers/driverVerificationHelpers'
import {
  useApproveVerificationMutation,
  useGetDriverVerificationQuery,
  useGetVerificationHistoryQuery,
  useRejectVerificationMutation,
  useRequestReVerificationMutation,
  useUpdateVerificationSecurityMutation,
  VERIFICATION_SOURCE_LABELS,
} from '@/services/driverVerificationApi'
import { TRIGGER_REASON_OPTIONS } from '@/services/mock/driverVerificationData'
import { formatDateTime } from '@/utils/format'
import { useDispatch } from 'react-redux'
import { api } from '@/services/api'

interface DriverVerificationDrawerProps {
  open: boolean
  driver: Driver | null
  focus?: DriverVerificationFocus
  onClose: () => void
}

function Section({
  id,
  title,
  children,
  sectionRef,
}: {
  id?: string
  title: string
  children: React.ReactNode
  sectionRef?: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div id={id} ref={sectionRef} className="mb-8">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-alygo-text-muted">{title}</h4>
      {children}
    </div>
  )
}

export function DriverVerificationDrawer({
  open,
  driver,
  focus = 'default',
  onClose,
}: DriverVerificationDrawerProps) {
  const dispatch = useDispatch()
  const historyRef = useRef<HTMLDivElement>(null)
  const compareRef = useRef<HTMLDivElement>(null)
  const selfieRef = useRef<HTMLDivElement>(null)
  const securityRef = useRef<HTMLDivElement>(null)
  const [requestForm] = Form.useForm()
  const [securityForm] = Form.useForm()
  const [rejectNotes, setRejectNotes] = useState('')

  const driverId = driver?.id ?? ''
  const { data: verification, isLoading } = useGetDriverVerificationQuery(driverId, { skip: !driverId || !open })
  const { data: history = [] } = useGetVerificationHistoryQuery(driverId, { skip: !driverId || !open })
  const [requestReVerification, { isLoading: requesting }] = useRequestReVerificationMutation()
  const [approveVerification, { isLoading: approving }] = useApproveVerificationMutation()
  const [rejectVerification, { isLoading: rejecting }] = useRejectVerificationMutation()
  const [updateSecurity, { isLoading: updatingSecurity }] = useUpdateVerificationSecurityMutation()

  useEffect(() => {
    if (!open || !driver) return
    const refs: Record<DriverVerificationFocus, React.RefObject<HTMLDivElement | null> | undefined> = {
      default: undefined,
      history: historyRef,
      compare: compareRef,
      selfie: selfieRef,
      security: securityRef,
    }
    const target = refs[focus]
    if (target?.current) {
      setTimeout(() => target.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    }
  }, [open, driver, focus])

  useEffect(() => {
    if (verification) {
      securityForm.setFieldsValue({
        requireBeforeNextTrip: verification.requireBeforeNextTrip,
        ridesPaused: verification.ridesPaused,
      })
    }
  }, [verification, securityForm])

  const invalidateDrivers = () => {
    dispatch(api.util.invalidateTags(['Drivers']))
  }

  if (!driver) return null

  const handleRequestReVerification = async (values: {
    triggerReason: string
    requireBeforeNextTrip?: boolean
    pauseRides?: boolean
  }) => {
    try {
      await requestReVerification({
        driverId: driver.id,
        triggerReason: values.triggerReason,
        requireBeforeNextTrip: values.requireBeforeNextTrip,
        pauseRides: values.pauseRides,
      }).unwrap()
      message.success('Re-verification requested')
      invalidateDrivers()
      requestForm.resetFields()
    } catch {
      message.error('Failed to request re-verification')
    }
  }

  const handleApprove = async () => {
    try {
      await approveVerification(driver.id).unwrap()
      message.success('Verification approved')
      invalidateDrivers()
    } catch {
      message.error('Failed to approve verification')
    }
  }

  const handleReject = async () => {
    try {
      await rejectVerification({ driverId: driver.id, notes: rejectNotes || undefined }).unwrap()
      message.success('Verification rejected')
      invalidateDrivers()
      setRejectNotes('')
    } catch {
      message.error('Failed to reject verification')
    }
  }

  const handleSecurityUpdate = async (values: { requireBeforeNextTrip: boolean; ridesPaused: boolean }) => {
    try {
      await updateSecurity({ driverId: driver.id, ...values }).unwrap()
      message.success('Security controls updated')
    } catch {
      message.error('Failed to update security controls')
    }
  }

  return (
    <Drawer
      title={`Driver — ${driver.name}`}
      open={open}
      onClose={onClose}
      width={720}
      destroyOnClose
      extra={
        verification && verification.status !== 'verified' ? (
          <div className="flex gap-2">
            <Button
              type="primary"
              size="small"
              icon={<CheckCircle className="h-4 w-4" />}
              loading={approving}
              onClick={handleApprove}
            >
              Approve
            </Button>
            <Button
              danger
              size="small"
              icon={<XCircle className="h-4 w-4" />}
              loading={rejecting}
              onClick={handleReject}
            >
              Reject
            </Button>
          </div>
        ) : null
      }
    >
      {isLoading || !verification ? (
        <div className="py-12 text-center text-alygo-text-muted">Loading verification data...</div>
      ) : (
        <>
          <Descriptions column={2} size="small" className="mb-6">
            <Descriptions.Item label="Driver ID">{driver.id}</Descriptions.Item>
            <Descriptions.Item label="Email">{driver.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{driver.phone}</Descriptions.Item>
            <Descriptions.Item label="Vehicle">{driver.vehicle}</Descriptions.Item>
            <Descriptions.Item label="Rating">{driver.rating} ★</Descriptions.Item>
            <Descriptions.Item label="Completed Trips">{driver.completedTrips}</Descriptions.Item>
          </Descriptions>

          <Section title="Identity Verification">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <IdentityVerificationBadge status={verification.status} />
              {verification.requireBeforeNextTrip && <Tag color="orange">Required before next trip</Tag>}
              {verification.ridesPaused && <Tag color="red">Rides paused</Tag>}
            </div>
            <Descriptions column={1} size="small" bordered className="mb-4">
              <Descriptions.Item label="Verification Status">
                {identityStatusLabel(verification.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Verification Date">
                {verification.verifiedAt ? formatDateTime(verification.verifiedAt) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Last Verification Date">
                {verification.lastVerifiedAt ? formatDateTime(verification.lastVerifiedAt) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Verification Source">
                {VERIFICATION_SOURCE_LABELS[verification.verificationSource] ?? verification.verificationSource}
              </Descriptions.Item>
              <Descriptions.Item label="Verification Notes">
                {verification.verificationNotes ?? '—'}
              </Descriptions.Item>
              {verification.reviewNotes && (
                <Descriptions.Item label="Review Notes">{verification.reviewNotes}</Descriptions.Item>
              )}
            </Descriptions>

            <div ref={compareRef}>
              <PhotoCompareView
                profilePhoto={verification.profilePhoto}
                liveSelfiePhoto={verification.liveSelfiePhoto}
                driverName={driver.name}
              />
            </div>

            <div ref={selfieRef} className="mt-4 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-alygo-text-muted">
              Live selfie verification uses real-time in-app camera capture. Gallery uploads are not permitted for identity checks.
            </div>
          </Section>

          <Section id="security-controls" title="Security Controls" sectionRef={securityRef}>
            <Form
              form={requestForm}
              layout="vertical"
              onFinish={handleRequestReVerification}
              className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                <Shield className="h-4 w-4 text-indigo-400" />
                Request Re-Verification
              </div>
              <Form.Item
                name="triggerReason"
                label="Trigger reason"
                rules={[{ required: true, message: 'Select a trigger reason' }]}
              >
                <Select options={TRIGGER_REASON_OPTIONS} placeholder="Select reason" />
              </Form.Item>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Form.Item name="requireBeforeNextTrip" label="Require verification before next trip" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item name="pauseRides" label="Pause ride requests until verified" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </div>
              <Button type="primary" htmlType="submit" loading={requesting}>
                Request Immediate Re-Verification
              </Button>
            </Form>

            <Form
              form={securityForm}
              layout="vertical"
              onFinish={handleSecurityUpdate}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <p className="mb-3 text-sm text-alygo-text-muted">Toggle ongoing security restrictions for this driver.</p>
              <Form.Item name="requireBeforeNextTrip" label="Require verification before next trip" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="ridesPaused" label="Temporarily pause ride requests" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Button htmlType="submit" loading={updatingSecurity}>
                Update Security Controls
              </Button>
            </Form>

            {verification.triggerReason && (
              <p className="mt-3 text-sm text-alygo-text-muted">
                Current trigger reason: <span className="text-white">{verification.triggerReason}</span>
              </p>
            )}

            <div className="mt-4">
              <label className="mb-1 block text-sm text-alygo-text-muted">Rejection notes (optional)</label>
              <Input.TextArea
                rows={2}
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Notes for rejection audit trail"
              />
            </div>
          </Section>

          <Section id="verification-history" title="Verification History" sectionRef={historyRef}>
            <Table
              size="small"
              pagination={{ pageSize: 5 }}
              rowKey="id"
              dataSource={history}
              scroll={{ x: 600 }}
              columns={[
                {
                  title: 'Date',
                  dataIndex: 'date',
                  width: 160,
                  render: (d: string) => formatDateTime(d),
                },
                { title: 'Trigger Source', dataIndex: 'triggerSource', ellipsis: true },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  render: (s: import('@/types/driverVerification').IdentityVerificationStatus) => (
                    <IdentityVerificationBadge status={s} />
                  ),
                },
                { title: 'Reviewed By', dataIndex: 'reviewedBy', width: 120 },
                { title: 'Notes', dataIndex: 'notes', ellipsis: true },
              ]}
            />
          </Section>
        </>
      )}
    </Drawer>
  )
}
