import { Avatar, Badge, Dropdown, Input, List, Tag } from 'antd'
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BrandLogo } from '@/components/shared/BrandLogo'
import { useGetNotificationsQuery } from '@/services/api'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { setGlobalSearch, setMobileSidebarOpen } from '@/store/slices/uiSlice'
import { formatDateTime } from '@/utils/format'

export function Header() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const globalSearch = useAppSelector((state) => state.ui.globalSearch)
  const { data: notifications = [] } = useGetNotificationsQuery()
  const unreadCount = notifications.filter((n) => !n.read).length

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
      } else if (key === 'settings') {
        navigate('/settings/platform')
      }
    },
  }

  const notificationContent = (
    <div className="w-80 p-2">
      <List
        size="small"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item className="!border-white/5">
            <List.Item.Meta
              title={
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-white">{item.title}</span>
                  {!item.read && <Tag color="blue">New</Tag>}
                </div>
              }
              description={
                <div>
                  <p className="text-xs text-alygo-text-muted">{item.message}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{formatDateTime(item.createdAt)}</p>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  )

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[rgba(15,17,23,0.85)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-alygo-text-muted hover:bg-white/5 lg:hidden"
            onClick={() => dispatch(setMobileSidebarOpen(true))}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden sm:flex sm:items-center sm:gap-3">
            <BrandLogo size="xs" imageClassName="!rounded-md lg:hidden" />
            <div className="hidden lg:block">
              <p className="text-xs uppercase tracking-wider text-[#94A3B8]">Alygo Operations</p>
              <p className="text-sm text-[#64748B]">Command Center</p>
            </div>
          </div>
        </div>

        <div className="hidden max-w-md flex-1 md:block">
          <Input
            prefix={<Search className="h-4 w-4 text-alygo-text-muted" />}
            placeholder="Search drivers, passengers, trips..."
            value={globalSearch}
            onChange={(e) => dispatch(setGlobalSearch(e.target.value))}
            className="!rounded-xl !border-white/10 !bg-white/5"
          />
        </div>

        <div className="flex items-center gap-2">
          <Dropdown popupRender={() => notificationContent} trigger={['click']} placement="bottomRight">
            <button type="button" className="relative rounded-xl p-2.5 hover:bg-white/5">
              <Badge count={unreadCount} size="small">
                <Bell className="h-5 w-5 text-alygo-text-muted" />
              </Badge>
            </button>
          </Dropdown>

          <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
            <button type="button" className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/5">
              <Avatar size={32} className="!bg-indigo-500">
                {user?.name?.charAt(0) ?? 'A'}
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-alygo-text-muted">{user?.role.replace(/_/g, ' ')}</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-alygo-text-muted md:block" />
            </button>
          </Dropdown>
        </div>
      </div>
    </header>
  )
}
