import { useState } from 'react'
import { Button, Table } from 'antd'
import { Plus } from 'lucide-react'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TableFilters } from '@/components/common/TableFilters'
import {
  BackgroundCheckFeeFormModal,
  type BackgroundCheckFeeFormValues,
} from '@/features/compliance/components/BackgroundCheckFeeFormModal'
import { DriverRestrictionFormModal } from '@/features/compliance/components/DriverRestrictionFormModal'
import {
  buildBackgroundCheckDetailFields,
  buildDocumentDetailFields,
  buildRestrictionDetailFields,
  getBackgroundCheckActionItems,
  getComplianceFeeActionItems,
  getDocumentMonitorActionItems,
  getDriverRestrictionActionItems,
} from '@/features/compliance/complianceHelpers'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCreateBackgroundCheckFeeMutation,
  useGetBackgroundCheckFeesQuery,
  useUpdateBackgroundCheckFeeMutation,
} from '@/services/backgroundCheckFeeApi'
import {
  useCreateDriverRestrictionMutation,
  useGetBackgroundChecksQuery,
  useGetDocumentMonitoringQuery,
  useGetDriverRestrictionsQuery,
  useRemoveDriverRestrictionMutation,
  useUpdateBackgroundCheckStatusMutation,
  useUpdateDriverRestrictionMutation,
} from '@/services/complianceCenterApi'
import type { BackgroundCheckFeeConfig } from '@/types/backgroundCheckFee'
import type {
  BackgroundCheckRecord,
  DocumentMonitorRecord,
  DriverRestrictionFormValues,
  DriverRestrictionRecord,
} from '@/types/complianceCenter'
import { formatCurrency, formatDate } from '@/utils/format'

const PAGE_SIZE = 10

export function BackgroundChecksTab() {
  const adminActions = useAdminActions()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [confirmAction, setConfirmAction] = useState<{
    record: BackgroundCheckRecord
    status: 'approved' | 'rejected'
  } | null>(null)

  const { data, isLoading } = useGetBackgroundChecksQuery({ page, pageSize: PAGE_SIZE, search })
  const [updateStatus, { isLoading: updating }] = useUpdateBackgroundCheckStatusMutation()

  const handleAction = (key: string, record: BackgroundCheckRecord) => {
    switch (key) {
      case 'view-report':
        adminActions.openDrawer(`Background Check — ${record.driverName}`, buildBackgroundCheckDetailFields(record))
        break
      case 'approve':
        setConfirmAction({ record, status: 'approved' })
        break
      case 'reject':
        setConfirmAction({ record, status: 'rejected' })
        break
    }
  }

  const handleConfirmStatus = async () => {
    if (!confirmAction) return
    try {
      await updateStatus({ id: confirmAction.record.id, status: confirmAction.status }).unwrap()
      adminActions.notify(
        confirmAction.status === 'approved' ? 'Background check approved' : 'Background check rejected',
        confirmAction.record.driverName,
      )
      setConfirmAction(null)
    } catch (err) {
      adminActions.notify('Unable to update background check', String(err))
    }
  }

  return (
    <>
      <TableFilters
        variant="inline"
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Search background checks..."
      />
      <Table
        className="mt-4"
        loading={isLoading || updating}
        rowKey="id"
        dataSource={data?.data ?? []}
        scroll={{ x: 900 }}
        pagination={{
          current: page,
          total: data?.total ?? 0,
          pageSize: PAGE_SIZE,
          onChange: setPage,
          showSizeChanger: false,
        }}
        {...createTableRowProps<BackgroundCheckRecord>((record) =>
          adminActions.openDrawer(record.driverName, buildBackgroundCheckDetailFields(record)),
        )}
        columns={[
          { title: 'Driver', dataIndex: 'driverName' },
          { title: 'Provider', dataIndex: 'provider' },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          { title: 'Submitted Date', dataIndex: 'submittedAt', render: (d: string) => formatDate(d) },
          {
            title: 'Completed Date',
            dataIndex: 'completedAt',
            render: (d?: string) => (d ? formatDate(d) : '—'),
          },
          createActionsColumn<BackgroundCheckRecord>(
            (record) => getBackgroundCheckActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />
      <ConfirmationModal
        open={Boolean(confirmAction)}
        title={confirmAction?.status === 'approved' ? 'Approve Background Check' : 'Reject Background Check'}
        description={`Are you sure you want to ${confirmAction?.status === 'approved' ? 'approve' : 'reject'} the background check for ${confirmAction?.record.driverName}?`}
        confirmLabel={confirmAction?.status === 'approved' ? 'Approve' : 'Reject'}
        danger={confirmAction?.status === 'rejected'}
        loading={updating}
        onConfirm={handleConfirmStatus}
        onCancel={() => setConfirmAction(null)}
      />
      <AdminActionHost actions={adminActions} />
    </>
  )
}

export function BackgroundCheckFeesTab() {
  const adminActions = useAdminActions()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<BackgroundCheckFeeConfig | null>(null)

  const { data, isLoading } = useGetBackgroundCheckFeesQuery({ page, pageSize: PAGE_SIZE, search })
  const [createFee, { isLoading: creating }] = useCreateBackgroundCheckFeeMutation()
  const [updateFee, { isLoading: updating }] = useUpdateBackgroundCheckFeeMutation()

  const handleAction = async (key: string, record: BackgroundCheckFeeConfig) => {
    switch (key) {
      case 'edit':
        setEditRecord(record)
        break
      case 'enable':
        try {
          await updateFee({ id: record.id, status: 'active' }).unwrap()
          adminActions.notify('Fee enabled', record.feeName)
        } catch (err) {
          adminActions.notify('Unable to enable fee', String(err))
        }
        break
      case 'disable':
        try {
          await updateFee({ id: record.id, status: 'inactive' }).unwrap()
          adminActions.notify('Fee disabled', record.feeName)
        } catch (err) {
          adminActions.notify('Unable to disable fee', String(err))
        }
        break
    }
  }

  const handleSubmit = async (values: BackgroundCheckFeeFormValues) => {
    try {
      if (editRecord) {
        await updateFee({ id: editRecord.id, ...values }).unwrap()
        adminActions.notify('Fee updated', editRecord.feeName)
        setEditRecord(null)
      } else {
        await createFee({ ...values, refundable: true }).unwrap()
        adminActions.notify('Fee created', values.feeName)
        setFormOpen(false)
      }
    } catch (err) {
      adminActions.notify('Unable to save fee', String(err))
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TableFilters
          variant="inline"
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          searchPlaceholder="Search fees..."
        />
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
          Add Fee
        </Button>
      </div>
      <Table
        loading={isLoading || creating || updating}
        rowKey="id"
        dataSource={data?.data ?? []}
        scroll={{ x: 800 }}
        pagination={{
          current: page,
          total: data?.total ?? 0,
          pageSize: PAGE_SIZE,
          onChange: setPage,
          showSizeChanger: false,
        }}
        columns={[
          { title: 'Fee Name', dataIndex: 'feeName' },
          { title: 'Amount', dataIndex: 'amount', render: (a: number) => formatCurrency(a) },
          { title: 'Applicable State', dataIndex: 'state' },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<BackgroundCheckFeeConfig>(
            (record) => getComplianceFeeActionItems(record),
            (key, record) => void handleAction(key, record),
          ),
        ]}
      />
      <BackgroundCheckFeeFormModal
        open={formOpen}
        mode="create"
        fee={null}
        loading={creating}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
      <BackgroundCheckFeeFormModal
        open={Boolean(editRecord)}
        mode="edit"
        fee={editRecord}
        loading={updating}
        onCancel={() => setEditRecord(null)}
        onSubmit={handleSubmit}
      />
      <AdminActionHost actions={adminActions} />
    </>
  )
}

export function DocumentMonitoringTab() {
  const adminActions = useAdminActions()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useGetDocumentMonitoringQuery({ page, pageSize: PAGE_SIZE, search })

  const handleAction = (key: string, record: DocumentMonitorRecord) => {
    switch (key) {
      case 'view':
        adminActions.openDrawer(record.documentType, buildDocumentDetailFields(record))
        break
      case 'notify':
        adminActions.notify('Driver notified', record.driverName)
        break
    }
  }

  return (
    <>
      <TableFilters
        variant="inline"
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Search documents..."
      />
      <Table
        className="mt-4"
        loading={isLoading}
        rowKey="id"
        dataSource={data?.data ?? []}
        scroll={{ x: 900 }}
        pagination={{
          current: page,
          total: data?.total ?? 0,
          pageSize: PAGE_SIZE,
          onChange: setPage,
          showSizeChanger: false,
        }}
        {...createTableRowProps<DocumentMonitorRecord>((record) =>
          adminActions.openDrawer(record.documentType, buildDocumentDetailFields(record)),
        )}
        columns={[
          { title: 'Driver', dataIndex: 'driverName' },
          { title: 'Document Type', dataIndex: 'documentType' },
          {
            title: 'Expiry Date',
            dataIndex: 'expiryDate',
            render: (d?: string) => (d ? formatDate(d) : '—'),
          },
          {
            title: 'Days Remaining',
            dataIndex: 'daysRemaining',
            render: (d: number | null) => (d != null ? d : '—'),
          },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<DocumentMonitorRecord>(
            () => getDocumentMonitorActionItems(),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />
      <AdminActionHost actions={adminActions} />
    </>
  )
}

export function DriverRestrictionsTab() {
  const adminActions = useAdminActions()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<DriverRestrictionRecord | null>(null)
  const [removeRecord, setRemoveRecord] = useState<DriverRestrictionRecord | null>(null)

  const { data, isLoading } = useGetDriverRestrictionsQuery({ page, pageSize: PAGE_SIZE, search })
  const [createRestriction, { isLoading: creating }] = useCreateDriverRestrictionMutation()
  const [updateRestriction, { isLoading: updating }] = useUpdateDriverRestrictionMutation()
  const [removeRestriction, { isLoading: removing }] = useRemoveDriverRestrictionMutation()

  const handleAction = (key: string, record: DriverRestrictionRecord) => {
    switch (key) {
      case 'edit':
        setEditRecord(record)
        break
      case 'remove':
        setRemoveRecord(record)
        break
    }
  }

  const handleSubmit = async (values: DriverRestrictionFormValues) => {
    try {
      if (editRecord) {
        await updateRestriction({ id: editRecord.id, ...values }).unwrap()
        adminActions.notify('Restriction updated', editRecord.driverName)
        setEditRecord(null)
      } else {
        await createRestriction(values).unwrap()
        adminActions.notify('Restriction added', values.driverName)
        setFormOpen(false)
      }
    } catch (err) {
      adminActions.notify('Unable to save restriction', String(err))
    }
  }

  const handleRemove = async () => {
    if (!removeRecord) return
    try {
      await removeRestriction(removeRecord.id).unwrap()
      adminActions.notify('Restriction removed', removeRecord.driverName)
      setRemoveRecord(null)
    } catch (err) {
      adminActions.notify('Unable to remove restriction', String(err))
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TableFilters
          variant="inline"
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          searchPlaceholder="Search restrictions..."
        />
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
          Add Restriction
        </Button>
      </div>
      <Table
        loading={isLoading || creating || updating || removing}
        rowKey="id"
        dataSource={data?.data ?? []}
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          total: data?.total ?? 0,
          pageSize: PAGE_SIZE,
          onChange: setPage,
          showSizeChanger: false,
        }}
        {...createTableRowProps<DriverRestrictionRecord>((record) =>
          adminActions.openDrawer(record.driverName, buildRestrictionDetailFields(record)),
        )}
        columns={[
          { title: 'Driver', dataIndex: 'driverName' },
          { title: 'Reason', dataIndex: 'reason', ellipsis: true },
          {
            title: 'Restricted Categories',
            dataIndex: 'restrictedCategories',
            render: (cats: string[]) => cats.join(', '),
            ellipsis: true,
          },
          {
            title: 'Restriction End Date',
            dataIndex: 'restrictionEndDate',
            render: (d?: string) => (d ? formatDate(d) : 'Indefinite'),
          },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<DriverRestrictionRecord>(
            () => getDriverRestrictionActionItems(),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />
      <DriverRestrictionFormModal
        open={formOpen}
        mode="create"
        restriction={null}
        loading={creating}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
      <DriverRestrictionFormModal
        open={Boolean(editRecord)}
        mode="edit"
        restriction={editRecord}
        loading={updating}
        onCancel={() => setEditRecord(null)}
        onSubmit={handleSubmit}
      />
      <ConfirmationModal
        open={Boolean(removeRecord)}
        title="Remove Restriction"
        description={`Remove the restriction for ${removeRecord?.driverName}?`}
        confirmLabel="Remove"
        danger
        loading={removing}
        onConfirm={handleRemove}
        onCancel={() => setRemoveRecord(null)}
      />
      <AdminActionHost actions={adminActions} />
    </>
  )
}
