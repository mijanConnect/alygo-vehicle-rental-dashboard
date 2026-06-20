import { useState } from 'react'
import { Button, DatePicker, Form, Input, Modal, Select, Steps } from 'antd'
import { RIDE_CATEGORY_LABELS } from '@/constants'
import type { Reservation } from '@/types'
import { useAdminActions } from '@/hooks/useAdminActions'

type CreateType = Reservation['type']

const RESERVATION_TYPE_LABEL: Record<CreateType, string> = {
  scheduled: 'Scheduled',
  airport: 'Airport',
  event: 'Event',
  business: 'Business',
}

interface CreateReservationModalProps {
  open: boolean
  onClose: () => void
}

export function CreateReservationModal({ open, onClose }: CreateReservationModalProps) {
  const adminActions = useAdminActions()
  const [step, setStep] = useState(0)
  const [type, setType] = useState<CreateType>('scheduled')
  const [form] = Form.useForm()

  const reset = () => {
    setStep(0)
    setType('scheduled')
    form.resetFields()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleCreate = async () => {
    const values = await form.validateFields()
    adminActions.notify(`${RESERVATION_TYPE_LABEL[type]} reservation created`)
    void values
    handleClose()
  }

  return (
    <Modal
      title="Create Reservation"
      open={open}
      onCancel={handleClose}
      width={560}
      destroyOnClose
      footer={
        <div className="flex justify-end gap-2">
          {step > 0 && <Button onClick={() => setStep(0)}>Back</Button>}
          <Button onClick={handleClose}>Cancel</Button>
          {step === 0 ? (
            <Button type="primary" disabled={!type} onClick={() => setStep(1)}>
              Continue
            </Button>
          ) : (
            <Button type="primary" onClick={handleCreate}>
              Create Reservation
            </Button>
          )}
        </div>
      }
    >
      <Steps
        current={step}
        size="small"
        className="mb-6"
        items={[{ title: 'Select Type' }, { title: 'Reservation Details' }]}
      />

      {step === 0 && (
        <Select
          className="w-full"
          placeholder="Select reservation type"
          value={type}
          onChange={setType}
          options={[
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'airport', label: 'Airport' },
            { value: 'event', label: 'Event' },
          ]}
        />
      )}

      {step === 1 && (
        <Form form={form} layout="vertical" className="mt-2">
          <Form.Item name="passengerName" label="Passenger Name" rules={[{ required: true }]}>
            <Input placeholder="Passenger name" />
          </Form.Item>
          <Form.Item name="category" label="Ride Category" rules={[{ required: true }]}>
            <Select
              options={Object.entries(RIDE_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
            />
          </Form.Item>

          {type === 'scheduled' && (
            <>
              <Form.Item name="pickup" label="Pickup" rules={[{ required: true }]}>
                <Input placeholder="Pickup address" />
              </Form.Item>
              <Form.Item name="dropoff" label="Dropoff" rules={[{ required: true }]}>
                <Input placeholder="Dropoff address" />
              </Form.Item>
              <Form.Item name="scheduledAt" label="Scheduled Time" rules={[{ required: true }]}>
                <DatePicker showTime className="w-full" />
              </Form.Item>
            </>
          )}

          {type === 'airport' && (
            <>
              <Form.Item name="airportCode" label="Airport" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'SFO', label: 'SFO — San Francisco Intl' },
                    { value: 'LAX', label: 'LAX — Los Angeles Intl' },
                    { value: 'JFK', label: 'JFK — JFK Intl' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="flightNumber" label="Flight Number" rules={[{ required: true }]}>
                <Input placeholder="AA1234" />
              </Form.Item>
              <Form.Item name="terminal" label="Terminal" rules={[{ required: true }]}>
                <Input placeholder="Terminal 2" />
              </Form.Item>
              <Form.Item name="scheduledAt" label="Pickup Time" rules={[{ required: true }]}>
                <DatePicker showTime className="w-full" />
              </Form.Item>
            </>
          )}

          {type === 'event' && (
            <>
              <Form.Item name="eventName" label="Event Name" rules={[{ required: true }]}>
                <Input placeholder="Tech Summit 2026" />
              </Form.Item>
              <Form.Item name="venue" label="Venue" rules={[{ required: true }]}>
                <Input placeholder="Convention Center" />
              </Form.Item>
              <Form.Item name="eventTime" label="Event Time" rules={[{ required: true }]}>
                <DatePicker showTime className="w-full" />
              </Form.Item>
              <Form.Item name="pickup" label="Pickup" rules={[{ required: true }]}>
                <Input placeholder="Pickup address" />
              </Form.Item>
            </>
          )}
        </Form>
      )}
    </Modal>
  )
}
