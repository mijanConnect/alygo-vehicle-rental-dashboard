import { DatePicker, Form, Input, Modal } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect } from 'react'
import { TimezoneSelect } from '@/components/shared/TimezoneSelect'
import type { HolidayItem, HolidayWritePayload } from '@/redux/api/holidayManageApi'

interface HolidayFormValues {
  holidayName: string
  timezone: string
  dateRange: [Dayjs, Dayjs]
  description: string
}

interface HolidayFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: HolidayItem | null
  loading?: boolean
  onCancel: () => void
  onSubmit: (payload: HolidayWritePayload) => Promise<void>
}

export function HolidayFormModal({
  open,
  mode,
  initialValues,
  loading,
  onCancel,
  onSubmit,
}: HolidayFormModalProps) {
  const [form] = Form.useForm<HolidayFormValues>()

  useEffect(() => {
    if (!open) return

    if (mode === 'edit' && initialValues) {
      form.setFieldsValue({
        holidayName: initialValues.holidayName,
        timezone: initialValues.timezone,
        dateRange: [dayjs(initialValues.startDate), dayjs(initialValues.endDate)],
        description: initialValues.description,
      })
    } else {
      form.setFieldsValue({
        holidayName: '',
        timezone: 'America/Los_Angeles',
        dateRange: undefined,
        description: '',
      })
    }
  }, [open, mode, initialValues, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    const [start, end] = values.dateRange

    await onSubmit({
      holidayName: values.holidayName.trim(),
      timezone: values.timezone,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      description: values.description.trim(),
    })
  }

  return (
    <Modal
      title={mode === 'create' ? 'Create Holiday' : 'Edit Holiday'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === 'create' ? 'Create Holiday' : 'Save Changes'}
      confirmLoading={loading}
      destroyOnClose
      width={560}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="holidayName"
          label="Holiday Name"
          rules={[{ required: true, message: 'Holiday name is required' }]}
        >
          <Input placeholder="e.g. Special Holiday - Today" />
        </Form.Item>

        <Form.Item
          name="timezone"
          label="Timezone"
          rules={[{ required: true, message: 'Timezone is required' }]}
        >
          <TimezoneSelect />
        </Form.Item>

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

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Description is required' }]}
        >
          <Input.TextArea rows={3} placeholder="Describe this holiday" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
