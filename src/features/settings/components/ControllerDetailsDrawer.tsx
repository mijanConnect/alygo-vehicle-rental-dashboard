import { Drawer, Empty, Tag } from 'antd'
import { getPermissionDisplayName } from '@/features/settings/rbacPermissionLabels'
import type { ControllerItem } from '@/redux/api/roleBaseAccessApi'

interface ControllerDetailsDrawerProps {
  open: boolean
  controller: ControllerItem | null
  onClose: () => void
}

export function ControllerDetailsDrawer({
  open,
  controller,
  onClose,
}: ControllerDetailsDrawerProps) {
  const permissions = controller?.permissions ?? []

  return (
    <Drawer
      title={controller ? controller.name : 'Controller Details'}
      open={open}
      onClose={onClose}
      width={480}
      destroyOnClose
    >
      {!controller ? (
        <Empty description="No controller selected" />
      ) : (
        <div className="space-y-6">
          <div className="space-y-2 text-sm">
            <div className="flex gap-3">
              <span className="min-w-[100px] text-alygo-text-muted">Email</span>
              <span className="text-white">{controller.email}</span>
            </div>
            <div className="flex gap-3">
              <span className="min-w-[100px] text-alygo-text-muted">Phone</span>
              <span className="text-white">
                {controller.phone
                  ? `${controller.countryCode ? `${controller.countryCode} ` : ''}${controller.phone}`
                  : '—'}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="min-w-[100px] text-alygo-text-muted">Status</span>
              <span className="text-white">
                {controller.status ? <Tag>{controller.status}</Tag> : '—'}
              </span>
            </div>
            <div className="flex gap-3">
              <span className="min-w-[100px] text-alygo-text-muted">Role</span>
              <span className="text-white">{controller.roleName || 'No role assigned'}</span>
            </div>
            {controller.roleDescription ? (
              <div className="flex gap-3">
                <span className="min-w-[100px] text-alygo-text-muted">About role</span>
                <span className="text-alygo-text-muted">{controller.roleDescription}</span>
              </div>
            ) : null}
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-alygo-text-muted">
              Page Access
            </h4>
            {permissions.length === 0 ? (
              <Empty description="No page access assigned" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {permissions.map((permission) => (
                  <div
                    key={permission.id || `${permission.module}-${permission.name}`}
                    className="rounded-lg border border-white/10 px-3 py-2"
                  >
                    <div className="text-sm text-white">
                      {getPermissionDisplayName(permission.module, permission.name)}
                    </div>
                    {permission.description ? (
                      <div className="mt-0.5 text-xs text-alygo-text-muted">
                        {permission.description}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  )
}
