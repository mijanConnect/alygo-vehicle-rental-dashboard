import type { ReactNode } from 'react'
import { ConfigProvider, theme } from 'antd'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatedBackground } from '@/features/auth/components/AnimatedBackground'
import { AuthPageTransition } from '@/features/auth/components/AuthPageTransition'

const authTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#F97316',
    colorSuccess: '#22C55E',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorBgContainer: '#111827',
    colorBorder: '#1F2937',
    colorText: '#FFFFFF',
    colorTextSecondary: '#94A3B8',
    borderRadius: 10,
    controlHeight: 44,
  },
}

interface AuthLayoutProps {
  children?: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const location = useLocation()

  return (
    <ConfigProvider theme={authTheme}>
      <div className="relative flex min-h-screen flex-col overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
          <div className="w-full max-w-[420px]">
            {children ?? (
              <AuthPageTransition routeKey={location.pathname}>
                <Outlet />
              </AuthPageTransition>
            )}
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}
