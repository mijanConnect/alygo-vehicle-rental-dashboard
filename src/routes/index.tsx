import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LazyPageFallback } from '@/components/common/PageLoader'
import { GuestRoute } from '@/features/auth/components/GuestRoute'
import { AuthLayout, DashboardLayout } from '@/layouts'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { LegacyRouteFallback } from '@/routes/LegacyRouteFallback'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'))
const OtpVerificationPage = lazy(() => import('@/features/auth/pages/OtpVerificationPage'))
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'))
const PasswordUpdatedPage = lazy(() => import('@/features/auth/pages/PasswordUpdatedPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const DriversPage = lazy(() => import('@/features/drivers/DriversPage'))
const DriverProfilePage = lazy(() => import('@/features/drivers/DriverProfilePage'))
const PassengersPage = lazy(() => import('@/features/passengers/PassengersPage'))
const PassengerProfilePage = lazy(() => import('@/features/passengers/PassengerProfilePage'))
const LiveTripsPage = lazy(() => import('@/features/operations/LiveTripsPage'))
const TripDetailPage = lazy(() => import('@/features/operations/TripDetailPage'))
const CancellationManagementPage = lazy(() => import('@/features/cancellations/CancellationManagementPage'))
const DriverRewardsPage = lazy(() => import('@/features/driver-rewards/DriverRewardsPage'))
const LegacyDriverRewardsRedirect = lazy(() =>
  import('@/features/driver-rewards/LegacyDriverRewardsRedirect').then((m) => ({
    default: m.LegacyDriverRewardsRedirect,
  })),
)
const TierManagementPage = lazy(() => import('@/features/driver-rewards/TierManagementPage'))
const TierDetailPage = lazy(() => import('@/features/driver-rewards/TierDetailPage'))
const LostFoundManagementPage = lazy(() => import('@/features/lost-found/LostFoundManagementPage'))
const TripCompletionReviewPage = lazy(() => import('@/features/trip-completion-review/TripCompletionReviewPage'))
const DrivingHoursManagementPage = lazy(() => import('@/features/driving-hours/DrivingHoursManagementPage'))
const OperationsPolicyCenterPage = lazy(() => import('@/features/operations-policy/OperationsPolicyCenterPage'))
const LocationDashboardPage = lazy(() => import('@/features/locations/LocationDashboardPage'))
const SafetyIncidentPage = lazy(() => import('@/features/safety-incidents/SafetyIncidentPage'))
const ComplianceCenterPage = lazy(() => import('@/features/compliance/ComplianceCenterPage'))
const CommunicationCenterPage = lazy(() => import('@/features/communication/CommunicationCenterPage'))
const LegacyCommunicationRedirect = lazy(() =>
  import('@/features/communication/LegacyCommunicationRedirect').then((m) => ({
    default: m.LegacyCommunicationRedirect,
  })),
)
const VehicleEligibilityPage = lazy(() => import('@/features/vehicle-eligibility/VehicleEligibilityPage'))
const RideCategoriesPage = lazy(() => import('@/features/ride-categories/RideCategoriesPage'))
const DemandIntelligenceCenterPage = lazy(() => import('@/features/demand-intelligence/DemandIntelligenceCenterPage'))
const DynamicPricingCenterPage = lazy(() => import('@/features/pricing/DynamicPricingCenterPage'))
const DriverBonusesPage = lazy(() => import('@/features/driver-bonuses/DriverBonusesPage'))
const ReservationCenterPage = lazy(() => import('@/features/reservations/ReservationCenterPage'))
const FinanceDashboardPage = lazy(() => import('@/features/finance/FinanceDashboardPage'))
const ReportsAnalyticsPage = lazy(() => import('@/features/analytics/ReportsAnalyticsPage'))
const PlatformSettingsPage = lazy(() => import('@/features/settings/PlatformSettingsPage'))
const NotificationsSettingsPage = lazy(() => import('@/features/settings/NotificationsSettingsPage'))
const IntegrationsPage = lazy(() => import('@/features/settings/IntegrationsPage'))
const ReservationConfigurationPage = lazy(() => import('@/features/settings/ReservationConfigurationPage'))
const SafetyConfigurationPage = lazy(() => import('@/features/settings/SafetyConfigurationPage'))
const LegalSettingsPage = lazy(() => import('@/features/settings/LegalSettingsPage'))
const AdminRolesPage = lazy(() => import('@/features/settings/AdminRolesPage'))

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<LazyPageFallback />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: (
      <GuestRoute>
        <AuthLayout />
      </GuestRoute>
    ),
    children: [
      { path: '/login', element: withSuspense(<LoginPage />) },
      { path: '/auth/forgot-password', element: withSuspense(<ForgotPasswordPage />) },
      { path: '/auth/verify-otp', element: withSuspense(<OtpVerificationPage />) },
      { path: '/auth/reset-password', element: withSuspense(<ResetPasswordPage />) },
      { path: '/auth/password-updated', element: withSuspense(<PasswordUpdatedPage />) },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: 'operations/live-trips', element: withSuspense(<LiveTripsPage />) },
      { path: 'operations/live-trips/:id', element: withSuspense(<TripDetailPage />) },
      { path: 'operations/active-drivers', element: <Navigate to="/drivers?tab=active" replace /> },
      { path: 'operations/active-passengers', element: <Navigate to="/passengers?tab=active" replace /> },
      { path: 'operations/ride-monitoring', element: <Navigate to="/operations/live-trips" replace /> },
      { path: 'operations/cancellation-management', element: withSuspense(<CancellationManagementPage />) },
      { path: 'operations/lost-found', element: withSuspense(<LostFoundManagementPage />) },
      { path: 'operations/trip-completion-review', element: withSuspense(<TripCompletionReviewPage />) },
      { path: 'operations/driving-hours', element: withSuspense(<DrivingHoursManagementPage />) },
      { path: 'operations/destination-filters', element: <Navigate to="/drivers/tiers?tab=configuration" replace /> },
      { path: 'operations/destination-filter-analytics', element: <Navigate to="/drivers/tiers?tab=overview" replace /> },
      { path: 'operations/driver-capacity', element: <Navigate to="/drivers" replace /> },
      { path: 'operations/driver-capacity-management', element: <Navigate to="/drivers" replace /> },
      { path: 'operations/policy-center', element: withSuspense(<OperationsPolicyCenterPage />) },
      { path: 'operations/safety-incidents', element: withSuspense(<SafetyIncidentPage />) },
      { path: 'operations/safety-incidents/settings', element: <Navigate to="/settings/safety" replace /> },
      { path: 'operations/safety-incidents/categories', element: <Navigate to="/settings/safety" replace /> },
      { path: 'communication', element: withSuspense(<CommunicationCenterPage />) },
      { path: 'communication/conversations', element: withSuspense(<LegacyCommunicationRedirect />) },
      { path: 'communication/active-trip-chats', element: withSuspense(<LegacyCommunicationRedirect />) },
      { path: 'communication/driver-support', element: withSuspense(<LegacyCommunicationRedirect />) },
      { path: 'communication/passenger-support', element: withSuspense(<LegacyCommunicationRedirect />) },
      { path: 'communication/safety', element: withSuspense(<LegacyCommunicationRedirect />) },
      { path: 'communication/broadcast', element: withSuspense(<LegacyCommunicationRedirect />) },
      { path: 'communication/templates', element: withSuspense(<LegacyCommunicationRedirect />) },
      { path: 'communication/internal-notes', element: withSuspense(<LegacyCommunicationRedirect />) },
      { path: 'communication/analytics', element: withSuspense(<LegacyCommunicationRedirect />) },
      { path: 'drivers', element: withSuspense(<DriversPage />) },
      { path: 'driver-rewards', element: withSuspense(<DriverRewardsPage />) },
      { path: 'drivers/rewards', element: withSuspense(<LegacyDriverRewardsRedirect />) },
      { path: 'drivers/tiers', element: withSuspense(<TierManagementPage />) },
      { path: 'drivers/tiers/:id', element: withSuspense(<TierDetailPage />) },
      { path: 'drivers/rewards/tier-management', element: <Navigate to="/drivers/tiers" replace /> },
      { path: 'drivers/waitlist', element: <Navigate to="/drivers" replace /> },
      { path: 'drivers/capacity', element: <Navigate to="/drivers" replace /> },
      { path: 'drivers/driver-capacity', element: <Navigate to="/drivers" replace /> },
      { path: 'driver-capacity', element: <Navigate to="/drivers" replace /> },
      { path: 'drivers/:id', element: withSuspense(<DriverProfilePage />) },
      { path: 'passengers', element: withSuspense(<PassengersPage />) },
      { path: 'passengers/:id', element: withSuspense(<PassengerProfilePage />) },
      { path: 'compliance', element: withSuspense(<ComplianceCenterPage />) },
      { path: 'compliance/background-checks', element: <Navigate to="/compliance?tab=background-checks" replace /> },
      { path: 'compliance/background-check-fees', element: <Navigate to="/compliance?tab=fees" replace /> },
      { path: 'compliance/documents', element: <Navigate to="/compliance?tab=documents" replace /> },
      { path: 'compliance/restrictions', element: <Navigate to="/compliance?tab=restrictions" replace /> },
      { path: 'vehicle-eligibility', element: withSuspense(<VehicleEligibilityPage />) },
      { path: 'eligibility/rules', element: <Navigate to="/vehicle-eligibility" replace /> },
      { path: 'eligibility/categories', element: <Navigate to="/vehicle-eligibility" replace /> },
      { path: 'eligibility/assignments', element: <Navigate to="/vehicle-eligibility" replace /> },
      { path: 'eligibility/premium-vehicles', element: <Navigate to="/vehicle-eligibility" replace /> },
      { path: 'ride-categories', element: withSuspense(<RideCategoriesPage />) },
      { path: 'categories/:category', element: <Navigate to="/ride-categories" replace /> },
      { path: 'demand-intelligence', element: withSuspense(<DemandIntelligenceCenterPage />) },
      { path: 'demand', element: <Navigate to="/demand-intelligence" replace /> },
      { path: 'demand/:section', element: <Navigate to="/demand-intelligence" replace /> },
      {
        path: 'pricing',
        children: [
          { index: true, element: withSuspense(<DynamicPricingCenterPage />) },
          { path: 'rules', element: <Navigate to="/pricing?tab=rules" replace /> },
          { path: 'surge-zones', element: <Navigate to="/pricing?tab=zones" replace /> },
          { path: 'surge-history', element: <Navigate to="/pricing?tab=analytics" replace /> },
        ],
      },
      { path: 'driver-bonuses', element: withSuspense(<DriverBonusesPage />) },
      {
        path: 'reservations',
        children: [
          { index: true, element: withSuspense(<ReservationCenterPage />) },
          { path: 'scheduled', element: <Navigate to="/reservations?type=scheduled" replace /> },
          { path: 'airport', element: <Navigate to="/reservations?type=airport" replace /> },
          { path: 'events', element: <Navigate to="/reservations?type=event" replace /> },
        ],
      },
      {
        path: 'locations',
        children: [
          { index: true, element: withSuspense(<LocationDashboardPage />) },
          { path: 'states', element: <Navigate to="/locations?tab=states" replace /> },
          { path: 'cities', element: <Navigate to="/locations?tab=cities" replace /> },
          { path: 'zones', element: <Navigate to="/locations?tab=zones" replace /> },
          { path: 'airports', element: <Navigate to="/locations?tab=airports" replace /> },
          { path: 'state-activation', element: <Navigate to="/locations?tab=states" replace /> },
          { path: 'airport-queue', element: <Navigate to="/locations?tab=airports" replace /> },
        ],
      },
      {
        path: 'finance',
        children: [
          { index: true, element: withSuspense(<FinanceDashboardPage />) },
          { path: 'revenue', element: <Navigate to="/finance?tab=revenue" replace /> },
          { path: 'payouts', element: <Navigate to="/finance?tab=payouts" replace /> },
          { path: 'wallets', element: <Navigate to="/finance?tab=wallets" replace /> },
          { path: 'transactions', element: <Navigate to="/finance?tab=transactions" replace /> },
        ],
      },
      {
        path: 'analytics',
        children: [
          { index: true, element: withSuspense(<ReportsAnalyticsPage />) },
          { path: 'drivers', element: <Navigate to="/analytics?tab=drivers" replace /> },
          { path: 'passengers', element: <Navigate to="/analytics?tab=passengers" replace /> },
          { path: 'revenue', element: <Navigate to="/analytics?tab=revenue" replace /> },
          { path: 'demand', element: <Navigate to="/analytics?tab=demand" replace /> },
          { path: 'compliance', element: <Navigate to="/analytics?tab=compliance" replace /> },
        ],
      },
      { path: 'settings/platform', element: withSuspense(<PlatformSettingsPage />) },
      { path: 'settings/safety', element: withSuspense(<SafetyConfigurationPage />) },
      { path: 'settings/notifications', element: withSuspense(<NotificationsSettingsPage />) },
      { path: 'settings/integrations', element: withSuspense(<IntegrationsPage />) },
      { path: 'settings/legal', element: withSuspense(<LegalSettingsPage />) },
      { path: 'settings/reservations', element: withSuspense(<ReservationConfigurationPage />) },
      { path: 'settings/admin-roles', element: withSuspense(<AdminRolesPage />) },
      { path: '*', element: withSuspense(<LegacyRouteFallback />) },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
