import { Form, InputNumber, Modal, Select } from 'antd'
import { useEffect, useMemo } from 'react'
import {
  getRefId,
} from '@/features/settings/fare-configurations/fareConfigurationHelpers'
import {
  useGetServiceAreaAirportsQuery,
  useGetServiceAreaCitiesQuery,
  useGetServiceAreaCountriesQuery,
  useGetServiceAreaStatesQuery,
  useGetServiceAreaZonesQuery,
} from '@/redux/api/areaServiceApi'
import type {
  FareConfigurationItem,
  FareConfigurationWritePayload,
} from '@/redux/api/fareConfigurationsApi'
import { useGetActiveRideCategoriesQuery } from '@/redux/api/rideCategoriesApi'

interface FareFormValues {
  serviceAreaId: string
  rideCategoryId?: string
  baseFare: number
  perKmFare: number
  perMinuteFare: number
  waitingFeePerMinute: number
  minimumFare: number
}

interface FareConfigurationFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: FareConfigurationItem | null
  loading?: boolean
  onCancel: () => void
  onSubmit: (payload: FareConfigurationWritePayload) => Promise<void>
}

export function FareConfigurationFormModal({
  open,
  mode,
  initialValues,
  loading,
  onCancel,
  onSubmit,
}: FareConfigurationFormModalProps) {
  const [form] = Form.useForm<FareFormValues>()

  const countriesQuery = useGetServiceAreaCountriesQuery(
    { page: 1, limit: 200, status: 'active' },
    { skip: !open },
  )
  const statesQuery = useGetServiceAreaStatesQuery(
    { page: 1, limit: 200, status: 'active' },
    { skip: !open },
  )
  const citiesQuery = useGetServiceAreaCitiesQuery(
    { page: 1, limit: 200, status: 'active' },
    { skip: !open },
  )
  const zonesQuery = useGetServiceAreaZonesQuery(
    { page: 1, limit: 200, status: 'active' },
    { skip: !open },
  )
  const airportsQuery = useGetServiceAreaAirportsQuery(
    { page: 1, limit: 200, status: 'active' },
    { skip: !open },
  )
  const rideCategoriesQuery = useGetActiveRideCategoriesQuery(
    { page: 1, limit: 200 },
    { skip: !open },
  )

  const serviceAreaOptions = useMemo(() => {
    const mapRows = (
      rows: { id: string; name: string; type: string }[] | undefined,
      typeLabel: string,
    ) =>
      (rows ?? []).map((item) => ({
        value: item.id,
        label: `${item.name} (${typeLabel})`,
      }))

    return [
      ...mapRows(countriesQuery.data?.data, 'Country'),
      ...mapRows(statesQuery.data?.data, 'State'),
      ...mapRows(citiesQuery.data?.data, 'City'),
      ...mapRows(zonesQuery.data?.data, 'Zone'),
      ...mapRows(airportsQuery.data?.data, 'Airport'),
    ]
  }, [
    airportsQuery.data?.data,
    citiesQuery.data?.data,
    countriesQuery.data?.data,
    statesQuery.data?.data,
    zonesQuery.data?.data,
  ])

  const rideCategoryOptions = useMemo(
    () =>
      (rideCategoriesQuery.data?.data ?? []).map((item) => ({
        value: item._id,
        label: item.name,
      })),
    [rideCategoriesQuery.data?.data],
  )

  useEffect(() => {
    if (!open) return

    if (mode === 'edit' && initialValues) {
      form.setFieldsValue({
        serviceAreaId: getRefId(initialValues.serviceAreaId),
        rideCategoryId: getRefId(initialValues.rideCategoryId),
        baseFare: initialValues.baseFare,
        perKmFare: initialValues.perKmFare,
        perMinuteFare: initialValues.perMinuteFare,
        waitingFeePerMinute: initialValues.waitingFeePerMinute,
        minimumFare: initialValues.minimumFare,
      })
    } else {
      form.resetFields()
      form.setFieldsValue({
        baseFare: 0,
        perKmFare: 0,
        perMinuteFare: 0,
        waitingFeePerMinute: 0,
        minimumFare: 0,
      })
    }
  }, [open, mode, initialValues, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    const payload: FareConfigurationWritePayload = {
      serviceAreaId: values.serviceAreaId,
      baseFare: values.baseFare,
      perKmFare: values.perKmFare,
      perMinuteFare: values.perMinuteFare,
      waitingFeePerMinute: values.waitingFeePerMinute,
      minimumFare: values.minimumFare,
    }
    if (values.rideCategoryId) {
      payload.rideCategoryId = values.rideCategoryId
    }
    await onSubmit(payload)
  }

  const areasLoading =
    countriesQuery.isLoading ||
    statesQuery.isLoading ||
    citiesQuery.isLoading ||
    zonesQuery.isLoading ||
    airportsQuery.isLoading

  return (
    <Modal
      title={mode === 'create' ? 'Create Fare Configuration' : 'Edit Fare Configuration'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === 'create' ? 'Create' : 'Save Changes'}
      confirmLoading={loading}
      destroyOnClose
      width={640}
    >
      <Form form={form} layout="vertical" className="mt-4">
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
            loading={areasLoading}
          />
        </Form.Item>

        <Form.Item name="rideCategoryId" label="Ride Category">
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Select ride category (optional)"
            options={rideCategoryOptions}
            loading={rideCategoriesQuery.isLoading}
          />
        </Form.Item>

        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4">
          <Form.Item
            name="baseFare"
            label="Base Fare"
            rules={[{ required: true, message: 'Base fare is required' }]}
          >
            <InputNumber min={0} step={0.1} className="!w-full" />
          </Form.Item>
          <Form.Item
            name="minimumFare"
            label="Minimum Fare"
            rules={[{ required: true, message: 'Minimum fare is required' }]}
          >
            <InputNumber min={0} step={0.1} className="!w-full" />
          </Form.Item>
          <Form.Item
            name="perKmFare"
            label="Per Km Fare"
            rules={[{ required: true, message: 'Per km fare is required' }]}
          >
            <InputNumber min={0} step={0.1} className="!w-full" />
          </Form.Item>
          <Form.Item
            name="perMinuteFare"
            label="Per Minute Fare"
            rules={[{ required: true, message: 'Per minute fare is required' }]}
          >
            <InputNumber min={0} step={0.1} className="!w-full" />
          </Form.Item>
          <Form.Item
            name="waitingFeePerMinute"
            label="Waiting Fee / Minute"
            rules={[{ required: true, message: 'Waiting fee is required' }]}
          >
            <InputNumber min={0} step={0.1} className="!w-full" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
