import { useCallback, useMemo, useState } from 'react'
import { Button, Table, Tabs, Tag } from 'antd'
import { Plus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { AdminActionHost } from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { CreateControllerModal } from '@/features/settings/components/CreateControllerModal'
import { CreateRoleModal } from '@/features/settings/components/CreateRoleModal'
import { ControllerDetailsDrawer } from '@/features/settings/components/ControllerDetailsDrawer'
import { getPermissionDisplayName } from '@/features/settings/rbacPermissionLabels'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useCreateControllerAndPermissionsMutation,
  useCreateRoleAndPermissionsMutation,
  useDeleteRoleMutation,
  useGetAllPermissionsPagelistQuery,
  useGetControllersListQuery,
  useGetRolesListQuery,
  type ControllerItem,
  type CreateControllerPayload,
  type CreateRolePayload,
  type RoleItem,
} from '@/redux/api/roleBaseAccessApi'

const TAB_KEYS = ['roles', 'controllers'] as const
type TabKey = (typeof TAB_KEYS)[number]

function resolveTab(tab: string | null): TabKey {
  if (tab === 'controllers') return 'controllers'
  return 'roles'
}

function RolesTab() {
  const adminActions = useAdminActions()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading, isFetching } = useGetRolesListQuery({
    page,
    limit,
    searchTerm,
  })
  const { data: permissionsData } = useGetAllPermissionsPagelistQuery({
    page: 1,
    limit: 200,
  })
  const [createRole, { isLoading: creating }] = useCreateRoleAndPermissionsMutation()
  const [deleteRole] = useDeleteRoleMutation()

  const permissionLabelById = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of permissionsData?.data ?? []) {
      map.set(
        item.permission.id,
        getPermissionDisplayName(item.module, item.permission.name),
      )
    }
    return map
  }, [permissionsData?.data])

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    setPage(1)
  }, [])

  const handleCreate = async (payload: CreateRolePayload) => {
    try {
      await createRole(payload).unwrap()
      adminActions.notify('Role created', payload.name)
      setCreateOpen(false)
    } catch {
      adminActions.notify('Unable to create role', payload.name)
    }
  }

  const handleDelete = (role: RoleItem) => {
    adminActions.openConfirm({
      title: 'Delete Role',
      description: `Delete role "${role.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: async () => {
        try {
          await deleteRole(role.id).unwrap()
          adminActions.notify('Role deleted', role.name)
        } catch {
          adminActions.notify('Unable to delete role', role.name)
        }
      },
    })
  }

  const rows = data?.data ?? []
  const meta = data?.meta

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchingInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search roles..."
        />
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
          Add New Role
        </Button>
      </div>

      <Table
        loading={isLoading || isFetching}
        rowKey="id"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 800 }}
        locale={{ emptyText: 'No roles yet' }}
        columns={[
          { title: 'Role Name', dataIndex: 'name', width: 180 },
          {
            title: 'Description',
            dataIndex: 'description',
            ellipsis: true,
            render: (v?: string) => v || '—',
          },
          {
            title: 'Permissions',
            dataIndex: 'permissions',
            render: (ids: string[]) => (
              <div className="flex flex-wrap gap-1">
                {(ids ?? []).length === 0 ? (
                  <span className="text-alygo-text-muted">—</span>
                ) : (
                  (ids ?? []).slice(0, 6).map((id) => (
                    <Tag key={id}>{permissionLabelById.get(id) || id.slice(-6)}</Tag>
                  ))
                )}
                {(ids ?? []).length > 6 ? (
                  <Tag>+{(ids ?? []).length - 6}</Tag>
                ) : null}
              </div>
            ),
          },
          {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            render: (_: unknown, record: RoleItem) => (
              <Button type="link" danger size="small" className="!px-1" onClick={() => handleDelete(record)}>
                Delete
              </Button>
            ),
          },
        ]}
      />

      <Pagination
        currentPage={page}
        totalPages={Math.max(meta?.totalPages ?? 1, 1)}
        totalItems={meta?.totalItems ?? 0}
        itemsPerPage={limit}
        onPageChange={setPage}
        onItemsPerPageChange={(next) => {
          setLimit(next)
          setPage(1)
        }}
      />

      <CreateRoleModal
        open={createOpen}
        loading={creating}
        onCancel={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
      <AdminActionHost actions={adminActions} />
    </>
  )
}

function ControllersTab() {
  const adminActions = useAdminActions()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedController, setSelectedController] = useState<ControllerItem | null>(null)

  const { data, isLoading, isFetching } = useGetControllersListQuery({
    page,
    limit,
    searchTerm,
  })
  const [createController, { isLoading: creating }] =
    useCreateControllerAndPermissionsMutation()

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    setPage(1)
  }, [])

  const handleCreate = async (payload: CreateControllerPayload) => {
    try {
      await createController(payload).unwrap()
      adminActions.notify('Controller created', payload.name)
      setCreateOpen(false)
    } catch {
      adminActions.notify('Unable to create controller', payload.name)
    }
  }

  const rows = data?.data ?? []
  const meta = data?.meta

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchingInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search controllers..."
        />
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
          Add New Controller
        </Button>
      </div>

      <Table
        loading={isLoading || isFetching}
        rowKey="id"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 900 }}
        locale={{ emptyText: 'No controllers yet' }}
        columns={[
          { title: 'Name', dataIndex: 'name', width: 180 },
          { title: 'Email', dataIndex: 'email', ellipsis: true },
          {
            title: 'Phone',
            key: 'phone',
            width: 160,
            render: (_: unknown, record: ControllerItem) =>
              record.phone
                ? `${record.countryCode ? `${record.countryCode} ` : ''}${record.phone}`
                : '—',
          },
          {
            title: 'Role',
            dataIndex: 'roleName',
            width: 160,
            render: (v?: string) => v || 'No role',
          },
          {
            title: 'Status',
            dataIndex: 'status',
            width: 110,
            render: (v?: string) => (v ? <Tag>{v}</Tag> : '—'),
          },
          {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            render: (_: unknown, record: ControllerItem) => (
              <Button
                type="link"
                size="small"
                className="!px-1"
                onClick={() => setSelectedController(record)}
              >
                Details
              </Button>
            ),
          },
        ]}
      />

      <Pagination
        currentPage={page}
        totalPages={Math.max(meta?.totalPages ?? 1, 1)}
        totalItems={meta?.totalItems ?? 0}
        itemsPerPage={limit}
        onPageChange={setPage}
        onItemsPerPageChange={(next) => {
          setLimit(next)
          setPage(1)
        }}
      />

      <CreateControllerModal
        open={createOpen}
        loading={creating}
        onCancel={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
      <ControllerDetailsDrawer
        open={Boolean(selectedController)}
        controller={selectedController}
        onClose={() => setSelectedController(null)}
      />
      <AdminActionHost actions={adminActions} />
    </>
  )
}

export default function AdminRolesPage() {
  useDocumentTitle('Admin Roles')
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = resolveTab(searchParams.get('tab'))

  return (
    <PageShell
      title="Admin Role Management"
      description="Create roles with permissions and assign controllers (admins) to those roles."
    >
      <div className="glass-card mt-6 p-4">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setSearchParams({ tab: key })}
          items={[
            {
              key: 'roles',
              label: 'Roles',
              children: <RolesTab />,
            },
            {
              key: 'controllers',
              label: 'Controllers',
              children: <ControllersTab />,
            },
          ]}
        />
      </div>
    </PageShell>
  )
}
