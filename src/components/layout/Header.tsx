import { Avatar, Badge, Button, Dropdown, Empty, Tag } from 'antd'
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGetProfileQuery } from '@/redux/api/authApi'
import { useGetNotificationsListQuery } from '@/redux/api/notificationApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { formatDateTime } from '@/utils/format'

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') ?? ''
const HEADER_NOTIFICATION_LIMIT = 5

function resolveAssetUrl(path?: string | null) {
  if (!path) return undefined
  if (path.startsWith('http') || path.startsWith('blob:')) return path
  return `${API_BASE}${path}`
}

export function Header() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const authUser = useAppSelector((state) => state.auth.user)
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const { data: profile } = useGetProfileQuery(undefined, { skip: !isAuthenticated })

  // Same shape as notifications page first page so RTK cache is shared when possible.
  const { data: notificationsData, isFetching } = useGetNotificationsListQuery(
    { page: 1, limit: 10 },
    { skip: !isAuthenticated },
  )
  const notifications = (notificationsData?.data ?? []).slice(0, HEADER_NOTIFICATION_LIMIT)
  const unreadCount = (notificationsData?.data ?? []).filter((n) => !n.read).length

  const displayName = profile?.name || authUser?.name || 'Admin'
  const displayRole = (profile?.role || authUser?.role || 'admin').replace(/_/g, ' ')
  const avatarUrl =
    resolveAssetUrl(profile?.profileImage) || resolveAssetUrl(authUser?.avatar)

  const userMenu = {
    items: [
      { key: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
      { key: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
      { type: 'divider' as const },
      {
        key: 'logout',
        label: 'Sign out',
        icon: <LogOut className="h-4 w-4" />,
        danger: true,
      },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === 'logout') {
        dispatch(logout())
        navigate('/login')
      } else if (key === 'profile' || key === 'settings') {
        navigate('/settings/profile')
      }
    },
  }

  const goToNotifications = () => {
    navigate('/notifications')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[rgba(15,17,23,0.85)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-end gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            popupRender={() => (
              <div className="w-80 overflow-hidden rounded-xl border border-white/10 bg-[#12141c] shadow-2xl shadow-black/50">
                <div className="border-b border-white/10 px-3 py-2">
                  <p className="text-sm font-medium text-white">Notifications</p>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-3 py-6">
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          <span className="text-alygo-text-muted">
                            {isFetching ? 'Loading...' : 'No notifications'}
                          </span>
                        }
                      />
                    </div>
                  ) : (
                    <ul className="divide-y divide-white/5">
                      {notifications.map((item) => (
                        <li key={item.id} className="px-3 py-2.5 hover:bg-white/5">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-white line-clamp-1">
                              {item.title || 'Notification'}
                            </p>
                            {!item.read && <Tag color="blue">New</Tag>}
                          </div>
                          {item.message ? (
                            <p className="mt-1 text-xs text-alygo-text-muted line-clamp-2">
                              {item.message}
                            </p>
                          ) : null}
                          <p className="mt-1 text-[11px] text-slate-500">
                            {item.createdAt ? formatDateTime(item.createdAt) : '—'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border-t border-white/10 bg-[#0e1017] px-2 py-1.5">
                  <Button
                    type="link"
                    className="!w-full !text-indigo-400"
                    onClick={goToNotifications}
                  >
                    See more
                  </Button>
                </div>
              </div>
            )}
          >
            <button type="button" className="relative rounded-xl p-2.5 hover:bg-white/5">
              <Badge count={unreadCount} size="small">
                <Bell className="h-5 w-5 text-alygo-text-muted" />
              </Badge>
            </button>
          </Dropdown>

          <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
            <button type="button" className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/5">
              <Avatar size={32} src={avatarUrl} className="!bg-indigo-500">
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-white">{displayName}</p>
                <p className="text-xs capitalize text-alygo-text-muted">{displayRole}</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-alygo-text-muted md:block" />
            </button>
          </Dropdown>
        </div>
      </div>
    </header>
  )
}
