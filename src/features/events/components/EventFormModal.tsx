import { DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useMemo } from 'react'
import { TimezoneSelect } from '@/components/shared/TimezoneSelect'
import { EventLocationPicker } from '@/features/events/components/EventLocationPicker'
import {
  DEFAULT_EVENT_CENTER,
  EVENT_STATUS_OPTIONS,
  getEventCoordinates,
} from '@/features/events/eventHelpers'
import {
  useGetServiceAreaAirportsQuery,
  useGetServiceAreaCitiesQuery,
  useGetServiceAreaZonesQuery,
} from '@/redux/api/areaServiceApi'
import type { EventItem, EventStatus, EventWritePayload } from '@/redux/api/eventsManageApi'

export interface EventFormValues {
  eventName: string
  description: string
  timezone: string
  dateRange: [Dayjs, Dayjs]
  serviceAreaId: string
  lat: number
  lng: number
  coverageRadiusKm: number
  status: EventStatus
}

interface EventFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: EventItem | null
  loading?: boolean
  onCancel: () => void
  onSubmit: (payload: EventWritePayload) => Promise<void>
}

export function EventFormModal({
  open,
  mode,
  initialValues,
  loading,
  onCancel,
  onSubmit,
}: EventFormModalProps) {
  const [form] = Form.useForm<EventFormValues>()
  const lat = Form.useWatch('lat', form)
  const lng = Form.useWatch('lng', form)

  const citiesQuery = useGetServiceAreaCitiesQuery(
    { page: 1, limit: 100, status: 'active' },
    { skip: !open },
  )
  const zonesQuery = useGetServiceAreaZonesQuery(
    { page: 1, limit: 100, status: 'active' },
    { skip: !open },
  )
  const airportsQuery = useGetServiceAreaAirportsQuery(
    { page: 1, limit: 100, status: 'active' },
    { skip: !open },
  )

  const serviceAreaOptions = useMemo(() => {
    const cities = (citiesQuery.data?.data ?? []).map((item) => ({
      value: item.id,
      label: `${item.name} (City)`,
    }))
    const zones = (zonesQuery.data?.data ?? []).map((item) => ({
      value: item.id,
      label: `${item.name} (Zone)`,
    }))
    const airports = (airportsQuery.data?.data ?? []).map((item) => ({
      value: item.id,
      label: `${item.name} (Airport)`,
    }))
    return [...airports, ...cities, ...zones]
  }, [airportsQuery.data?.data, citiesQuery.data?.data, zonesQuery.data?.data])

  useEffect(() => {
    if (!open) return

    if (mode === 'edit' && initialValues) {
      const coords = getEventCoordinates(initialValues)
      form.setFieldsValue({
        eventName: initialValues.eventName,
        description: initialValues.description,
        timezone: initialValues.timezone,
        dateRange: [dayjs(initialValues.startDateTime), dayjs(initialValues.endDateTime)],
        serviceAreaId: initialValues.serviceAreaId,
        lat: coords.lat,
        lng: coords.lng,
        coverageRadiusKm: initialValues.coverageRadiusKm,
        status: initialValues.status,
      })
    } else {
      form.setFieldsValue({
        eventName: '',
        description: '',
        timezone: 'Asia/Dhaka',
        dateRange: undefined,
        serviceAreaId: undefined,
        lat: DEFAULT_EVENT_CENTER.lat,
        lng: DEFAULT_EVENT_CENTER.lng,
        coverageRadiusKm: 10,
        status: 'active',
      })
    }
  }, [open, mode, initialValues, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    const [start, end] = values.dateRange

    await onSubmit({
      eventName: values.eventName.trim(),
      description: values.description.trim(),
      timezone: values.timezone,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      serviceAreaId: values.serviceAreaId,
      location: {
        type: 'Point',
        coordinates: [values.lng, values.lat],
      },
      coverageRadiusKm: values.coverageRadiusKm,
      status: values.status,
    })
  }

  return (
    <Modal
      title={mode === 'create' ? 'Create Event' : 'Edit Event'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === 'create' ? 'Create Event' : 'Save Changes'}
      confirmLoading={loading}
      destroyOnClose
      width={720}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="eventName"
          label="Event Name"
          rules={[{ required: true, message: 'Event name is required' }]}
        >
          <Input placeholder="e.g. Airport Passenger Rush" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Description is required' }]}
        >
          <Input.TextArea rows={3} placeholder="Describe this event" />
        </Form.Item>

        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4">
          <Form.Item
            name="timezone"
            label="Timezone"
            rules={[{ required: true, message: 'Timezone is required' }]}
          >
            <TimezoneSelect />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Status is required' }]}
          >
            <Select options={EVENT_STATUS_OPTIONS} />
          </Form.Item>
        </div>

        <Form.Item
          name="dateRange"
          label="Start / End Date & Time"
          rules={[{ required: true, message: 'Start and end date/time are required' }]}
        >
          <DatePicker.RangePicker
            showTime
            className="!w-full"
            format="YYYY-MM-DD HH:mm"
          />
        </Form.Item>

        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4">
          <Form.Item
            name="serviceAreaId"
            label="Service Area"
            rules={[{ required: true, message: 'Service area is required' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Select service area"
              options={serviceAreaOptions}
              loading={
                citiesQuery.isLoading || zonesQuery.isLoading || airportsQuery.isLoading
              }
            />
          </Form.Item>
          <Form.Item
            name="coverageRadiusKm"
            label="Coverage Radius (km)"
            rules={[{ required: true, message: 'Coverage radius is required' }]}
          >
            <InputNumber min={0} className="!w-full" />
          </Form.Item>
        </div>

        <Form.Item label="Event Location" required className="mb-2">
          <EventLocationPicker
            lat={lat}
            lng={lng}
            onChange={({ lat: nextLat, lng: nextLng }) => {
              form.setFieldsValue({ lat: nextLat, lng: nextLng })
            }}
          />
        </Form.Item>

        <Form.Item
          name="lat"
          rules={[{ required: true, message: 'Latitude is required' }]}
          hidden
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          name="lng"
          rules={[{ required: true, message: 'Longitude is required' }]}
          hidden
        >
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  )
}
