import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { router } from '@/routes'
import { store } from '@/store'

const antTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#6366f1',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorBgContainer: 'rgba(22, 25, 34, 0.72)',
    colorBgElevated: '#161922',
    colorBorder: 'rgba(255, 255, 255, 0.08)',
    colorText: '#f8fafc',
    colorTextSecondary: '#94a3b8',
    borderRadius: 12,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  },
  components: {
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
    },
    Table: {
      headerBg: 'rgba(255, 255, 255, 0.03)',
      rowHoverBg: 'rgba(255, 255, 255, 0.04)',
    },
  },
}

export default function App() {
  return (
    <Provider store={store}>
      <ConfigProvider theme={antTheme}>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </ConfigProvider>
    </Provider>
  )
}
