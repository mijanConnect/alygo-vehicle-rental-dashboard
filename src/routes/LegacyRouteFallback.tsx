import { lazy, Suspense } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LazyPageFallback } from '@/components/common/PageLoader'
import { resolveLegacyRouteRedirect } from '@/constants/legacyRoutes'

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

export function LegacyRouteFallback() {
  const location = useLocation()
  const target = resolveLegacyRouteRedirect(location.pathname)

  if (target) {
    if (target.includes('?')) {
      return <Navigate to={target} replace />
    }
    const next = location.search ? `${target}${location.search}` : target
    return <Navigate to={next} replace />
  }

  return (
    <Suspense fallback={<LazyPageFallback />}>
      <NotFoundPage />
    </Suspense>
  )
}
