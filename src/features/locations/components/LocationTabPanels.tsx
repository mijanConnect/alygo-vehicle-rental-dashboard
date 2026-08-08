import { useCallback, useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Table, Tag } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { TimezoneSelect } from '@/components/shared/TimezoneSelect'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCreateServiceAreaMutation,
  useGetServiceAreaAirportsQuery,
  useGetServiceAreaCitiesQuery,
  useGetServiceAreaCountriesQuery,
  useGetServiceAreaStatesQuery,
  useGetServiceAreaZonesQuery,
  type CreateServiceAreaBody,
  type ServiceAreaRow,
  type ServiceAreaType,
} from '@/redux/api/areaServiceApi'
import {
  getServiceAreaActionItems,
  openServiceAreaDrawer,
  SERVICE_AREA_STATUS_COLORS,
  SERVICE_AREA_STATUS_LABELS,
  serviceAreaTypeLabel,
} from '@/features/locations/serviceAreaHelpers'
import { formatNumber } from '@/utils/format'

type CreateFormValues = {
  name: string
  countryId?: string
  stateId?: string
  cityId?: string
  lng: number
  lat: number
  maxDrivers?: number
  coverageRadiusKm: number
  timezone: string
}

function toOptions(rows: ServiceAreaRow[] = []) {
  return rows.map((item) => ({ value: item.id, label: item.name }))
}

function ServiceAreaPanel({
  type,
  nameColumnTitle,
  description,
}: {
  type: Exclude<ServiceAreaType, 'global'>
  nameColumnTitle: string
  description: string
}) {
  const adminActions = useAdminActions()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCountryId, setFilterCountryId] = useState<string | undefined>()
  const [filterStateId, setFilterStateId] = useState<string | undefined>()
  const [filterCityId, setFilterCityId] = useState<string | undefined>()
  const [addOpen, setAddOpen] = useState(false)
  const [form] = Form.useForm<CreateFormValues>()

  const createCountryId = Form.useWatch('countryId', form)
  const createStateId = Form.useWatch('stateId', form)

  // Optional list filters: all rows load first; parent id narrows the query
  const showCountryFilter = type === 'state'
  const showStateFilter = type === 'city'
  const showCityFilter = type === 'zone' || type === 'airport'

  const listParams = {
    page,
    limit,
    searchTerm,
    countryId: type === 'state' ? filterCountryId : undefined,
    stateId: type === 'city' ? filterStateId : undefined,
    cityId: type === 'zone' || type === 'airport' ? filterCityId : undefined,
  }

  const countriesQuery = useGetServiceAreaCountriesQuery(listParams, {
    skip: type !== 'country',
  })
  const statesQuery = useGetServiceAreaStatesQuery(listParams, {
    skip: type !== 'state',
  })
  const citiesQuery = useGetServiceAreaCitiesQuery(listParams, {
    skip: type !== 'city',
  })
  const zonesQuery = useGetServiceAreaZonesQuery(listParams, {
    skip: type !== 'zone',
  })
  const airportsQuery = useGetServiceAreaAirportsQuery(listParams, {
    skip: type !== 'airport',
  })

  const activeQuery =
    type === 'country'
      ? countriesQuery
      : type === 'state'
        ? statesQuery
        : type === 'city'
          ? citiesQuery
          : type === 'zone'
            ? zonesQuery
            : airportsQuery

  // Filter / create parent dropdowns — load all, optionally narrowed by parent
  const countriesForSelect = useGetServiceAreaCountriesQuery(
    { page: 1, limit: 100 },
    { skip: !showCountryFilter },
  )
  // Always available for create forms that need country
  const countriesForCreate = useGetServiceAreaCountriesQuery(
    { page: 1, limit: 100 },
    {
      skip:
        !addOpen ||
        (type !== 'state' && type !== 'city' && type !== 'zone' && type !== 'airport'),
    },
  )

  const filterStates = useGetServiceAreaStatesQuery(
    { page: 1, limit: 100 },
    { skip: !showStateFilter },
  )
  const filterCities = useGetServiceAreaCitiesQuery(
    { page: 1, limit: 100 },
    { skip: !showCityFilter },
  )

  const createStates = useGetServiceAreaStatesQuery(
    { page: 1, limit: 100, countryId: createCountryId },
    { skip: !addOpen || (type !== 'city' && type !== 'zone' && type !== 'airport') },
  )
  const createCities = useGetServiceAreaCitiesQuery(
    { page: 1, limit: 100, stateId: createStateId },
    { skip: !addOpen || (type !== 'zone' && type !== 'airport') },
  )

  const [createArea, { isLoading: creating }] = useCreateServiceAreaMutation()

  const rows = activeQuery.data?.data ?? []
  const meta = activeQuery.data?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.totalItems ?? 0

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    setPage(1)
  }, [])

  const handleItemsPerPageChange = (nextLimit: number) => {
    setLimit(nextLimit)
    setPage(1)
  }

  const handleAction = (key: string, record: ServiceAreaRow) => {
    if (key === 'view') {
      openServiceAreaDrawer(record, adminActions)
    }
  }

  const buildCreateBody = (values: CreateFormValues): CreateServiceAreaBody => {
    const location = {
      type: 'Point' as const,
      coordinates: [values.lng, values.lat] as [number, number],
    }

    const base = {
      type,
      location,
      maxDrivers: values.maxDrivers,
      coverageRadiusKm: values.coverageRadiusKm,
      timezone: values.timezone,
    }

    switch (type) {
      case 'country':
        return { ...base, country: values.name.trim() }
      case 'state':
        return {
          ...base,
          countryId: values.countryId,
          state: values.name.trim(),
        }
      case 'city':
        return {
          ...base,
          countryId: values.countryId,
          stateId: values.stateId,
          city: values.name.trim(),
        }
      case 'zone':
        return {
          ...base,
          cityId: values.cityId,
          zone: values.name.trim(),
        }
      case 'airport':
        return {
          ...base,
          cityId: values.cityId,
          airport: values.name.trim(),
        }
      default:
        return base
    }
  }

  const openCreateModal = () => {
    form.resetFields()
    form.setFieldsValue({
      timezone: 'Asia/Dhaka',
      coverageRadiusKm:
        type === 'country'
          ? 300
          : type === 'state'
            ? 80
            : type === 'city'
              ? 25
              : type === 'zone'
                ? 5
                : 10,
      maxDrivers: 0,
      lng: 90.4125,
      lat: 23.8103,
      countryId: filterCountryId,
      stateId: filterStateId,
      cityId: filterCityId,
    })
    setAddOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-alygo-text-muted">{description}</p>
        <Button type="primary" onClick={openCreateModal}>
          Add {serviceAreaTypeLabel(type)}
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {showCountryFilter && (
          <Select
            showSearch
            allowClear
            optionFilterProp="label"
            placeholder="Filter by country"
            className="w-full lg:w-56"
            options={toOptions(countriesForSelect.data?.data)}
            value={filterCountryId}
            onChange={(value) => {
              setFilterCountryId(value)
              setPage(1)
            }}
          />
        )}
        {showStateFilter && (
          <Select
            showSearch
            allowClear
            optionFilterProp="label"
            placeholder="Filter by state"
            className="w-full lg:w-56"
            options={toOptions(filterStates.data?.data)}
            value={filterStateId}
            onChange={(value) => {
              setFilterStateId(value)
              setPage(1)
            }}
          />
        )}
        {showCityFilter && (
          <Select
            showSearch
            allowClear
            optionFilterProp="label"
            placeholder="Filter by city"
            className="w-full lg:w-56"
            options={toOptions(filterCities.data?.data)}
            value={filterCityId}
            onChange={(value) => {
              setFilterCityId(value)
              setPage(1)
            }}
          />
        )}
        <SearchingInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={`Search ${nameColumnTitle.toLowerCase()}...`}
          className="flex-1"
        />
      </div>

      <Table
        loading={activeQuery.isLoading || activeQuery.isFetching}
        rowKey="id"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 700 }}
        {...createTableRowProps<ServiceAreaRow>((record) =>
          openServiceAreaDrawer(record, adminActions),
        )}
        columns={[
          { title: nameColumnTitle, dataIndex: 'name' },
          ...(type === 'state'
            ? [
                {
                  title: 'Country',
                  dataIndex: 'countryName',
                  render: (name: string | null) => name || '—',
                },
              ]
            : []),
          ...(type === 'city'
            ? [
                {
                  title: 'State',
                  dataIndex: 'stateName',
                  render: (name: string | null) => name || '—',
                },
                {
                  title: 'Country',
                  dataIndex: 'countryName',
                  render: (name: string | null) => name || '—',
                },
              ]
            : []),
          ...(type === 'zone' || type === 'airport'
            ? [
                {
                  title: 'City',
                  dataIndex: 'cityName',
                  render: (name: string | null) => name || '—',
                },
              ]
            : []),
          {
            title: 'Status',
            dataIndex: 'status',
            width: 150,
            render: (status: string) => (
              <Tag color={SERVICE_AREA_STATUS_COLORS[status] ?? 'default'}>
                {SERVICE_AREA_STATUS_LABELS[status] ?? status.replace(/_/g, ' ')}
              </Tag>
            ),
          },
          {
            title: 'Max Drivers',
            dataIndex: 'maxDrivers',
            width: 140,
            render: (n: number) => formatNumber(n),
          },
          createActionsColumn<ServiceAreaRow>(
            () => getServiceAreaActionItems(),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      <Pagination
        currentPage={page}
        totalPages={Math.max(totalPages, 1)}
        totalItems={totalItems}
        itemsPerPage={limit}
        onPageChange={setPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      <Modal
        title={`Add ${serviceAreaTypeLabel(type)}`}
        open={addOpen}
        confirmLoading={creating}
        onCancel={() => setAddOpen(false)}
        onOk={() => form.submit()}
        okText="Create"
        width={640}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
          onFinish={async (values) => {
            try {
              await createArea(buildCreateBody(values)).unwrap()
              adminActions.notify(`${serviceAreaTypeLabel(type)} created`)
              setAddOpen(false)
            } catch {
              adminActions.notify(
                `Unable to create ${serviceAreaTypeLabel(type).toLowerCase()}`,
              )
            }
          }}
        >
          {(type === 'state' || type === 'city' || type === 'zone' || type === 'airport') && (
            <Form.Item
              name="countryId"
              label="Country"
              rules={[{ required: true, message: 'Country is required' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select country"
                options={toOptions(countriesForCreate.data?.data)}
                className="w-full"
                onChange={() => {
                  form.setFieldsValue({ stateId: undefined, cityId: undefined })
                }}
              />
            </Form.Item>
          )}

          {(type === 'city' || type === 'zone' || type === 'airport') && (
            <Form.Item
              name="stateId"
              label="State"
              rules={[{ required: true, message: 'State is required' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select state"
                options={toOptions(createStates.data?.data)}
                className="w-full"
                onChange={() => {
                  form.setFieldsValue({ cityId: undefined })
                }}
              />
            </Form.Item>
          )}

          {(type === 'zone' || type === 'airport') && (
            <Form.Item
              name="cityId"
              label="City"
              rules={[{ required: true, message: 'City is required' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select city"
                options={toOptions(createCities.data?.data)}
                className="w-full"
              />
            </Form.Item>
          )}

          <Form.Item
            name="name"
            label={`${serviceAreaTypeLabel(type)} Name`}
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input className="!h-[45px]" placeholder={`Enter ${type} name`} />
          </Form.Item>

          <div className="grid gap-3 sm:grid-cols-2">
            <Form.Item
              name="lng"
              label="Longitude"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber className="!h-[45px] w-full" controls={false} />
            </Form.Item>
            <Form.Item
              name="lat"
              label="Latitude"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber className="!h-[45px] w-full" controls={false} />
            </Form.Item>
            <Form.Item name="maxDrivers" label="Max Drivers">
              <InputNumber min={0} className="!h-[45px] w-full" controls={false} />
            </Form.Item>
            <Form.Item
              name="coverageRadiusKm"
              label="Coverage Radius (km)"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber min={0} className="!h-[45px] w-full" controls={false} />
            </Form.Item>
          </div>

          <Form.Item
            name="timezone"
            label="Timezone"
            rules={[{ required: true, message: 'Timezone is required' }]}
          >
            <TimezoneSelect />
          </Form.Item>
        </Form>
      </Modal>

      <AdminActionHost actions={adminActions} />
    </div>
  )
}

export function CountriesPanel() {
  return (
    <ServiceAreaPanel
      type="country"
      nameColumnTitle="Country"
      description="Manage countries and top-level service coverage."
    />
  )
}

export function StatesPanel() {
  return (
    <ServiceAreaPanel
      type="state"
      nameColumnTitle="State"
      description="All states load by default. Filter by country when needed."
    />
  )
}

export function CitiesPanel() {
  return (
    <ServiceAreaPanel
      type="city"
      nameColumnTitle="City"
      description="All cities load by default. Filter by state when needed."
    />
  )
}

export function ZonesPanel() {
  return (
    <ServiceAreaPanel
      type="zone"
      nameColumnTitle="Zone"
      description="All zones load by default. Filter by city when needed."
    />
  )
}

export function AirportsPanel() {
  return (
    <ServiceAreaPanel
      type="airport"
      nameColumnTitle="Airport"
      description="All airports load by default. Filter by city when needed."
    />
  )
}
