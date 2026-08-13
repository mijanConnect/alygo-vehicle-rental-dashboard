import { Checkbox, Form, Input, Modal, TimePicker } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect } from 'react'
import { TimezoneSelect } from '@/components/shared/TimezoneSelect'
import { PEAK_HOUR_DAY_OPTIONS } from '@/features/pick-hours/peakHourHelpers'
import type {
  PeakHourDay,
  PeakHourItem,
  PeakHourWritePayload,
} from '@/redux/api/pickHoursApi'

interface PeakHourFormValues {
  name: string
  timezone: string
  timeRange: [Dayjs, Dayjs]
  applicableDays: PeakHourDay[]
}

interface PeakHourFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: PeakHourItem | null
  loading?: boolean
  onCancel: () => void
  onSubmit: (payload: PeakHourWritePayload) => Promise<void>
}

const TIME_FORMAT = 'HH:mm'

export function PeakHourFormModal({
  open,
  mode,
  initialValues,
  loading,
  onCancel,
  onSubmit,
}: PeakHourFormModalProps) {
  const [form] = Form.useForm<PeakHourFormValues>()

  useEffect(() => {
    if (!open) return

    if (mode === 'edit' && initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        timezone: initialValues.timezone,
        timeRange: [
          dayjs(initialValues.startTime, TIME_FORMAT),
          dayjs(initialValues.endTime, TIME_FORMAT),
        ],
        applicableDays: initialValues.applicableDays ?? [],
      })
    } else {
      form.setFieldsValue({
        name: '',
        timezone: 'America/Los_Angeles',
        timeRange: undefined,
        applicableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      })
    }
  }, [open, mode, initialValues, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    const [start, end] = values.timeRange

    await onSubmit({
      name: values.name.trim(),
      startTime: start.format(TIME_FORMAT),
      endTime: end.format(TIME_FORMAT),
      timezone: values.timezone,
      applicableDays: values.applicableDays,
    })
  }

  return (
    <Modal
      title={mode === 'create' ? 'Create Peak Hour' : 'Edit Peak Hour'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === 'create' ? 'Create Peak Hour' : 'Save Changes'}
      confirmLoading={loading}
      destroyOnClose
      width={560}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input placeholder="e.g. Evening Peak Hour" />
        </Form.Item>

        <Form.Item
          name="timezone"
          label="Timezone"
          rules={[{ required: true, message: 'Timezone is required' }]}
        >
          <TimezoneSelect />
        </Form.Item>

        <Form.Item
          name="timeRange"
          label="Start / End Time"
          rules={[{ required: true, message: 'Start and end time are required' }]}
        >
          <TimePicker.RangePicker
            className="!w-full"
            format={TIME_FORMAT}
            minuteStep={5}
            order={false}
          />
        </Form.Item>

        <Form.Item
          name="applicableDays"
          label="Applicable Days"
          rules={[
            { required: true, message: 'Select at least one day' },
            { type: 'array', min: 1, message: 'Select at least one day' },
          ]}
        >
          <Checkbox.Group
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
            options={PEAK_HOUR_DAY_OPTIONS}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
