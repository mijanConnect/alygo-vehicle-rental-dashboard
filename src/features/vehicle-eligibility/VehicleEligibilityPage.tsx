import { useMemo, useState } from 'react'
import { Button, Table, Tag } from 'antd'
import { Plus } from 'lucide-react'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
} from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { TableFilters } from '@/components/common/TableFilters'
import { CategoryMappingFormModal } from '@/features/vehicle-eligibility/components/CategoryMappingFormModal'
import { EligibilityRuleFormModal } from '@/features/vehicle-eligibility/components/EligibilityRuleFormModal'
import { PremiumVehicleFormModal } from '@/features/vehicle-eligibility/components/PremiumVehicleFormModal'
import {
  getCategoryMappingActionItems,
  getEligibilityRuleActionItems,
  getEligibilityStatusColor,
  getEligibilityStatusLabel,
  getMappingStatusColor,
  getMappingStatusLabel,
  getPremiumVehicleActionItems,
} from '@/features/vehicle-eligibility/vehicleEligibilityHelpers'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  CATEGORY_MAPPING_STATUS_OPTIONS,
  VEHICLE_ELIGIBILITY_STATUS_OPTIONS,
} from '@/services/mock/vehicleEligibilityData'
import { useGetRideCategoriesQuery } from '@/services/rideCategoryApi'
import {
  useCreateCategoryAssignmentMappingMutation,
  useCreatePremiumVehicleMutation,
  useDeleteCategoryAssignmentMappingMutation,
  useDeletePremiumVehicleMutation,
  useGetCategoryAssignmentMappingsQuery,
  useGetCategoryEligibilityRulesQuery,
  useGetPremiumVehicleApprovalsQuery,
  useToggleCategoryAssignmentMappingMutation,
  useToggleCategoryEligibilityRuleMutation,
  useUpdateCategoryAssignmentMappingMutation,
  useUpdateCategoryEligibilityRuleMutation,
  useUpdatePremiumVehicleMutation,
} from '@/services/vehicleEligibilityApi'
import type {
  CategoryAssignmentMapping,
  CategoryEligibilityRule,
  CategoryEligibilityRuleFormValues,
  CategoryMappingFormValues,
  CategoryMappingStatus,
  PremiumVehicleApproval,
  PremiumVehicleFormValues,
  VehicleEligibilityStatus,
} from '@/types/vehicleEligibility'

const PAGE_SIZE = 10

export default function VehicleEligibilityPage() {
  useDocumentTitle('Vehicle Eligibility Management')
  const adminActions = useAdminActions()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [rulesPage, setRulesPage] = useState(1)
  const [vehiclesPage, setVehiclesPage] = useState(1)
  const [mappingsPage, setMappingsPage] = useState(1)
  const [mappingsSearch, setMappingsSearch] = useState('')
  const [mappingsStatus, setMappingsStatus] = useState('')

  const [editRule, setEditRule] = useState<CategoryEligibilityRule | null>(null)
  const [premiumModalOpen, setPremiumModalOpen] = useState(false)
  const [editVehicle, setEditVehicle] = useState<PremiumVehicleApproval | null>(null)
  const [deleteVehicle, setDeleteVehicle] = useState<PremiumVehicleApproval | null>(null)
  const [mappingModalOpen, setMappingModalOpen] = useState(false)
  const [editMapping, setEditMapping] = useState<CategoryAssignmentMapping | null>(null)
  const [deleteMapping, setDeleteMapping] = useState<CategoryAssignmentMapping | null>(null)

  const listParams = {
    search,
    status: status as VehicleEligibilityStatus | '',
    pageSize: PAGE_SIZE,
  }

  const { data: rideCategoriesData } = useGetRideCategoriesQuery({ page: 1, pageSize: 100 })
  const categoryOptions = useMemo(
    () =>
      (rideCategoriesData?.data ?? []).map((c) => ({
        label: c.name,
        value: c.id,
      })),
    [rideCategoriesData?.data],
  )

  const { data: rulesData, isLoading: rulesLoading } = useGetCategoryEligibilityRulesQuery({
    ...listParams,
    page: rulesPage,
  })
  const { data: vehiclesData, isLoading: vehiclesLoading } = useGetPremiumVehicleApprovalsQuery({
    ...listParams,
    page: vehiclesPage,
  })
  const { data: mappingsData, isLoading: mappingsLoading } = useGetCategoryAssignmentMappingsQuery({
    search: mappingsSearch,
    status: mappingsStatus as CategoryMappingStatus | '',
    page: mappingsPage,
    pageSize: PAGE_SIZE,
  })

  const [updateRule, { isLoading: updatingRule }] = useUpdateCategoryEligibilityRuleMutation()
  const [toggleRule, { isLoading: togglingRule }] = useToggleCategoryEligibilityRuleMutation()
  const [createVehicle, { isLoading: creatingVehicle }] = useCreatePremiumVehicleMutation()
  const [updateVehicle, { isLoading: updatingVehicle }] = useUpdatePremiumVehicleMutation()
  const [deleteVehicleMutation, { isLoading: deletingVehicle }] = useDeletePremiumVehicleMutation()
  const [createMapping, { isLoading: creatingMapping }] = useCreateCategoryAssignmentMappingMutation()
  const [updateMapping, { isLoading: updatingMapping }] = useUpdateCategoryAssignmentMappingMutation()
  const [deleteMappingMutation, { isLoading: deletingMapping }] =
    useDeleteCategoryAssignmentMappingMutation()
  const [toggleMapping, { isLoading: togglingMapping }] =
    useToggleCategoryAssignmentMappingMutation()

  const handleRuleAction = async (key: string, record: CategoryEligibilityRule) => {
    if (key === 'edit') {
      setEditRule(record)
      return
    }
    if (key === 'toggle') {
      try {
        await toggleRule(record.id).unwrap()
        adminActions.notify(
          record.status === 'enabled' ? 'Rule disabled' : 'Rule enabled',
          record.categoryName,
        )
      } catch (err) {
        adminActions.notify('Unable to update rule status', String(err))
      }
    }
  }

  const handleVehicleAction = (key: string, record: PremiumVehicleApproval) => {
    if (key === 'edit') setEditVehicle(record)
    if (key === 'delete') setDeleteVehicle(record)
  }

  const handleSaveRule = async (values: CategoryEligibilityRuleFormValues) => {
    if (!editRule) return
    try {
      await updateRule({ id: editRule.id, ...values }).unwrap()
      adminActions.notify('Eligibility rule updated', editRule.categoryName)
      setEditRule(null)
    } catch (err) {
      adminActions.notify('Unable to update rule', String(err))
    }
  }

  const handleSaveVehicle = async (values: PremiumVehicleFormValues) => {
    try {
      if (editVehicle) {
        await updateVehicle({ id: editVehicle.id, ...values }).unwrap()
        adminActions.notify('Premium vehicle updated', `${values.make} ${values.model}`)
        setEditVehicle(null)
      } else {
        await createVehicle(values).unwrap()
        adminActions.notify('Premium vehicle added', `${values.make} ${values.model}`)
        setPremiumModalOpen(false)
      }
    } catch (err) {
      adminActions.notify('Unable to save premium vehicle', String(err))
    }
  }

  const handleDeleteVehicle = async () => {
    if (!deleteVehicle) return
    try {
      await deleteVehicleMutation(deleteVehicle.id).unwrap()
      adminActions.notify('Premium vehicle deleted', `${deleteVehicle.make} ${deleteVehicle.model}`)
      setDeleteVehicle(null)
    } catch (err) {
      adminActions.notify('Unable to delete vehicle', String(err))
    }
  }

  const handleSaveMapping = async (values: CategoryMappingFormValues) => {
    try {
      if (editMapping) {
        await updateMapping({ id: editMapping.id, ...values }).unwrap()
        adminActions.notify('Category mapping updated', values.vehicleType)
        setEditMapping(null)
      } else {
        await createMapping(values).unwrap()
        adminActions.notify('Category mapping created', values.vehicleType)
        setMappingModalOpen(false)
      }
    } catch (err) {
      adminActions.notify('Unable to save mapping', String(err))
    }
  }

  const handleMappingAction = async (key: string, record: CategoryAssignmentMapping) => {
    switch (key) {
      case 'edit':
        setEditMapping(record)
        break
      case 'toggle':
        try {
          await toggleMapping(record.id).unwrap()
          adminActions.notify(
            record.status === 'active' ? 'Mapping disabled' : 'Mapping enabled',
            record.vehicleType,
          )
        } catch (err) {
          adminActions.notify('Unable to update mapping status', String(err))
        }
        break
      case 'delete':
        setDeleteMapping(record)
        break
    }
  }

  const handleDeleteMapping = async () => {
    if (!deleteMapping) return
    try {
      await deleteMappingMutation(deleteMapping.id).unwrap()
      adminActions.notify('Category mapping deleted', deleteMapping.vehicleType)
      setDeleteMapping(null)
    } catch (err) {
      adminActions.notify('Unable to delete mapping', String(err))
    }
  }

  return (
    <PageShell
      title="Vehicle Eligibility Management"
      description="Manage vehicle eligibility requirements, category assignments, and premium vehicle approvals."
    >
      <TableFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setRulesPage(1)
          setVehiclesPage(1)
        }}
        searchPlaceholder="Search eligibility rules or premium vehicles..."
        statusOptions={VEHICLE_ELIGIBILITY_STATUS_OPTIONS}
        status={status}
        onStatusChange={(value) => {
          setStatus(value ?? '')
          setRulesPage(1)
          setVehiclesPage(1)
        }}
      />

      <section className="glass-card p-5">
        <h3 className="mb-4 text-base font-semibold text-white">Category Eligibility Rules</h3>
        <Table
          loading={rulesLoading || togglingRule}
          rowKey="id"
          dataSource={rulesData?.data ?? []}
          scroll={{ x: 900 }}
          pagination={{
            current: rulesPage,
            total: rulesData?.total ?? 0,
            pageSize: PAGE_SIZE,
            onChange: setRulesPage,
            showSizeChanger: false,
          }}
          columns={[
            { title: 'Category', dataIndex: 'categoryName' },
            { title: 'Minimum Vehicle Year', dataIndex: 'minVehicleYear' },
            {
              title: 'Minimum Driver Rating',
              dataIndex: 'minDriverRating',
              render: (r: number) => r.toFixed(1),
            },
            {
              title: 'Commercial Insurance Required',
              dataIndex: 'commercialInsuranceRequired',
              render: (v: boolean) => (v ? 'Yes' : 'No'),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (s: VehicleEligibilityStatus) => (
                <Tag color={getEligibilityStatusColor(s)}>{getEligibilityStatusLabel(s)}</Tag>
              ),
            },
            createActionsColumn<CategoryEligibilityRule>(
              (record) => getEligibilityRuleActionItems(record.status),
              (key, record) => void handleRuleAction(key, record),
            ),
          ]}
        />
      </section>

      <section className="glass-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-white">Premium Vehicle Approvals</h3>
          <Button
            type="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditVehicle(null)
              setPremiumModalOpen(true)
            }}
          >
            Add Premium Vehicle
          </Button>
        </div>
        <Table
          loading={vehiclesLoading}
          rowKey="id"
          dataSource={vehiclesData?.data ?? []}
          scroll={{ x: 900 }}
          pagination={{
            current: vehiclesPage,
            total: vehiclesData?.total ?? 0,
            pageSize: PAGE_SIZE,
            onChange: setVehiclesPage,
            showSizeChanger: false,
          }}
          columns={[
            { title: 'Make', dataIndex: 'make' },
            { title: 'Model', dataIndex: 'model' },
            {
              title: 'Year Requirement',
              dataIndex: 'yearRequirement',
              render: (y: number) => `${y}+`,
            },
            {
              title: 'Assigned Categories',
              dataIndex: 'assignedCategoryNames',
              render: (names: string[]) => names.join(', '),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (s: VehicleEligibilityStatus) => (
                <Tag color={getEligibilityStatusColor(s)}>{getEligibilityStatusLabel(s)}</Tag>
              ),
            },
            createActionsColumn<PremiumVehicleApproval>(
              () => getPremiumVehicleActionItems(),
              (key, record) => handleVehicleAction(key, record),
            ),
          ]}
        />
      </section>

      <section className="glass-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-white">Category Assignments</h3>
          <Button
            type="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditMapping(null)
              setMappingModalOpen(true)
            }}
          >
            Add Mapping
          </Button>
        </div>

        <TableFilters
          variant="inline"
          search={mappingsSearch}
          onSearchChange={(value) => {
            setMappingsSearch(value)
            setMappingsPage(1)
          }}
          searchPlaceholder="Search vehicle types or ride categories..."
          statusOptions={CATEGORY_MAPPING_STATUS_OPTIONS}
          status={mappingsStatus}
          onStatusChange={(value) => {
            setMappingsStatus(value ?? '')
            setMappingsPage(1)
          }}
        />

        <Table
          className="mt-4"
          loading={mappingsLoading || togglingMapping}
          rowKey="id"
          dataSource={mappingsData?.data ?? []}
          scroll={{ x: 700 }}
          pagination={{
            current: mappingsPage,
            total: mappingsData?.total ?? 0,
            pageSize: PAGE_SIZE,
            onChange: setMappingsPage,
            showSizeChanger: false,
          }}
          columns={[
            { title: 'Vehicle Type', dataIndex: 'vehicleType' },
            { title: 'Assigned Ride Category', dataIndex: 'rideCategoryName' },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (s: CategoryMappingStatus) => (
                <Tag color={getMappingStatusColor(s)}>{getMappingStatusLabel(s)}</Tag>
              ),
            },
            createActionsColumn<CategoryAssignmentMapping>(
              (record) => getCategoryMappingActionItems(record.status),
              (key, record) => void handleMappingAction(key, record),
            ),
          ]}
        />
      </section>

      <EligibilityRuleFormModal
        open={Boolean(editRule)}
        rule={editRule}
        categoryOptions={categoryOptions}
        loading={updatingRule}
        onCancel={() => setEditRule(null)}
        onSubmit={handleSaveRule}
      />

      <PremiumVehicleFormModal
        open={premiumModalOpen || Boolean(editVehicle)}
        mode={editVehicle ? 'edit' : 'create'}
        vehicle={editVehicle}
        categoryOptions={categoryOptions}
        loading={creatingVehicle || updatingVehicle}
        onCancel={() => {
          setPremiumModalOpen(false)
          setEditVehicle(null)
        }}
        onSubmit={handleSaveVehicle}
      />

      <CategoryMappingFormModal
        open={mappingModalOpen || Boolean(editMapping)}
        mode={editMapping ? 'edit' : 'create'}
        mapping={editMapping}
        categoryOptions={categoryOptions}
        loading={creatingMapping || updatingMapping}
        onCancel={() => {
          setMappingModalOpen(false)
          setEditMapping(null)
        }}
        onSubmit={handleSaveMapping}
      />

      <ConfirmationModal
        open={Boolean(deleteMapping)}
        title="Delete Mapping"
        description="Are you sure you want to delete this category mapping?"
        confirmLabel="Delete"
        danger
        loading={deletingMapping}
        onConfirm={handleDeleteMapping}
        onCancel={() => setDeleteMapping(null)}
      />

      <ConfirmationModal
        open={Boolean(deleteVehicle)}
        title="Delete Premium Vehicle"
        description="Are you sure you want to delete this premium vehicle? This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deletingVehicle}
        onConfirm={handleDeleteVehicle}
        onCancel={() => setDeleteVehicle(null)}
      />

      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
