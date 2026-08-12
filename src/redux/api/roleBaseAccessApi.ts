import { baseApi } from '@/redux/baseApi'
import { cleanObject } from '@/utils/cleanObject'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPage: number
}

interface PaginatedApiResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta?: PaginationMeta
}

export interface GroupedPermissionItem {
  module: string
  permission: {
    id: string
    name: string
    key: string
    description: string
    status: string
  }
}

export interface RoleItem {
  id: string
  name: string
  description?: string
  permissions: string[]
  createdAt?: string
  updatedAt?: string
}

export interface ControllerPermission {
  id: string
  name: string
  module: string
  key?: string
  description?: string
  status?: string
}

export interface ControllerItem {
  id: string
  name: string
  email: string
  phone?: string
  countryCode?: string
  roleId?: string
  roleName?: string
  roleDescription?: string
  permissions: ControllerPermission[]
  status?: string
  createdAt?: string
}

export interface CreateRolePayload {
  name: string
  description: string
  permissions: string[]
}

export interface UpdateRolePayload {
  roleId: string
  name?: string
  description?: string
  permissions?: string[]
}

export interface CreateControllerPayload {
  name: string
  email: string
  password: string
  phone: string
  countryCode: string
  roleId: string
}

export interface RbacListParams {
  page?: number
  limit?: number
  searchTerm?: string
}

export interface RbacListResult<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

function mapMeta(meta: PaginationMeta | undefined, count: number) {
  return {
    page: meta?.page ?? 1,
    limit: meta?.limit ?? 10,
    totalItems: meta?.total ?? count,
    totalPages: meta?.totalPage ?? 1,
  }
}

function normalizeRole(raw: Record<string, unknown>): RoleItem {
  const permissionsRaw = raw.permissions
  const permissions = Array.isArray(permissionsRaw)
    ? permissionsRaw.map((p) =>
        typeof p === 'string'
          ? p
          : String((p as { id?: string; _id?: string }).id ?? (p as { _id?: string })._id ?? ''),
      ).filter(Boolean)
    : []

  return {
    id: String(raw.id ?? raw._id ?? ''),
    name: String(raw.name ?? '—'),
    description: raw.description ? String(raw.description) : '',
    permissions,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  }
}

function normalizeController(raw: Record<string, unknown>): ControllerItem {
  const roleRaw = raw.roleId
  const nestedRole =
    roleRaw && typeof roleRaw === 'object'
      ? (roleRaw as Record<string, unknown>)
      : null

  const permissionsRaw = nestedRole?.permissions
  const permissions: ControllerPermission[] = Array.isArray(permissionsRaw)
    ? permissionsRaw.map((p) => {
        const item = p as Record<string, unknown>
        return {
          id: String(item.id ?? item._id ?? ''),
          name: String(item.name ?? ''),
          module: String(item.module ?? item.name ?? ''),
          key: item.key ? String(item.key) : undefined,
          description: item.description ? String(item.description) : undefined,
          status: item.status ? String(item.status) : undefined,
        }
      })
    : []

  const roleIdValue =
    nestedRole
      ? String(nestedRole.id ?? nestedRole._id ?? '')
      : typeof roleRaw === 'string'
        ? roleRaw
        : ''

  return {
    id: String(raw.id ?? raw._id ?? ''),
    name: String(raw.name ?? '—'),
    email: String(raw.email ?? '—'),
    phone: raw.phone ? String(raw.phone) : undefined,
    countryCode: raw.countryCode ? String(raw.countryCode) : undefined,
    roleId: roleIdValue || undefined,
    roleName: nestedRole?.name ? String(nestedRole.name) : undefined,
    roleDescription: nestedRole?.description
      ? String(nestedRole.description)
      : undefined,
    permissions,
    status: raw.status ? String(raw.status) : undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
  }
}

export const roleBaseAccessApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPermissionsPagelist: builder.query<
      RbacListResult<GroupedPermissionItem>,
      RbacListParams | void
    >({
      query: ({ page = 1, limit = 100, searchTerm } = {}) => ({
        url: '/rbac/permissions/grouped',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<GroupedPermissionItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: ['Permissions'],
    }),

    getRolesList: builder.query<RbacListResult<RoleItem>, RbacListParams | void>({
      query: ({ page = 1, limit = 10, searchTerm } = {}) => ({
        url: '/rbac/roles',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<Record<string, unknown>>) => {
        const rows = (response.data ?? []).map(normalizeRole)
        return {
          data: rows,
          meta: mapMeta(response.meta, rows.length),
        }
      },
      providesTags: ['Roles'],
    }),

    getControllersList: builder.query<RbacListResult<ControllerItem>, RbacListParams | void>({
      query: ({ page = 1, limit = 10, searchTerm } = {}) => ({
        url: '/rbac/admins',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<Record<string, unknown>>) => {
        const rows = (response.data ?? []).map(normalizeController)
        return {
          data: rows,
          meta: mapMeta(response.meta, rows.length),
        }
      },
      providesTags: ['Controllers'],
    }),

    createRoleAndPermissions: builder.mutation<
      { success: boolean; message: string },
      CreateRolePayload
    >({
      query: (role) => ({
        url: '/rbac/roles',
        method: 'POST',
        body: role,
      }),
      transformResponse: (response: ApiResponse<unknown>) => ({
        success: response.success,
        message: response.message,
      }),
      invalidatesTags: ['Roles'],
    }),

    updateRolePermissions: builder.mutation<
      { success: boolean; message: string },
      UpdateRolePayload
    >({
      query: ({ roleId, ...body }) => ({
        url: `/rbac/roles/${roleId}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ApiResponse<unknown>) => ({
        success: response.success,
        message: response.message,
      }),
      invalidatesTags: ['Roles'],
    }),

    deleteRole: builder.mutation<{ success: boolean; message: string }, string>({
      query: (roleId) => ({
        url: `/rbac/roles/${roleId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<unknown>) => ({
        success: response.success,
        message: response.message,
      }),
      invalidatesTags: ['Roles'],
    }),

    createControllerAndPermissions: builder.mutation<
      { success: boolean; message: string },
      CreateControllerPayload
    >({
      query: (controller) => ({
        url: '/rbac/admins/create-with-role',
        method: 'POST',
        body: controller,
      }),
      transformResponse: (response: ApiResponse<unknown>) => ({
        success: response.success,
        message: response.message,
      }),
      invalidatesTags: ['Controllers'],
    }),
  }),
})

export const {
  useGetAllPermissionsPagelistQuery,
  useGetRolesListQuery,
  useGetControllersListQuery,
  useCreateRoleAndPermissionsMutation,
  useUpdateRolePermissionsMutation,
  useDeleteRoleMutation,
  useCreateControllerAndPermissionsMutation,
} = roleBaseAccessApi
