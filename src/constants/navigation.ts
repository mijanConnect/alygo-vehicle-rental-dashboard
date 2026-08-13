import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarDays,
  Car,
  CreditCard,
  // FileCheck,
  Gauge,
  Globe2,
  Image,
  LayoutDashboard,
  Map,
  MapPin,
  MessageSquare,
  PartyPopper,
  Clock,
  LifeBuoy,
  Plane,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Wallet,
  // Gift,
} from 'lucide-react'
import type { Permission } from '@/types'

export interface NavItem {
  key: string
  label: string
  path?: string
  icon?: LucideIcon
  permission?: Permission
  children?: NavItem[]
}

export const NAVIGATION: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    permission: 'dashboard.view',
  },
  {
    key: 'operations',
    label: 'Operations',
    icon: Activity,
    permission: 'operations.view',
    children: [
      { key: 'live-trips', label: 'Live Trips', path: '/operations/live-trips' },
      { key: 'cancellation-management', label: 'Cancellation Management', path: '/operations/cancellation-management' },
      { key: 'lost-found', label: 'Lost & Found', path: '/operations/lost-found' },
      { key: 'trip-completion-review', label: 'Trip Completion Review', path: '/operations/trip-completion-review' },
      { key: 'driving-hours', label: 'Driving Hours', path: '/operations/driving-hours' },
      // { key: 'policy-center', label: 'Operations Policy Center', path: '/operations/policy-center' },
      // { key: 'safety-incidents', label: 'Safety & Incident Management', path: '/operations/safety-incidents' },
    ],
  },
  {
    key: 'communication',
    label: 'Communication Center',
    path: '/communication',
    icon: MessageSquare,
    permission: 'communication.view',
  },
  {
    key: 'banners',
    label: 'Banner Management',
    path: '/banners',
    icon: Image,
    permission: 'settings.view',
  },
  {
    key: 'events',
    label: 'Events Management',
    path: '/events',
    icon: CalendarDays,
    permission: 'operations.view',
  },
  {
    key: 'holidays',
    label: 'Holiday Management',
    path: '/holidays',
    icon: PartyPopper,
    permission: 'operations.view',
  },
  {
    key: 'peak-hours',
    label: 'Peak Hours Management',
    path: '/peak-hours',
    icon: Clock,
    permission: 'operations.view',
  },
  {
    key: 'help-supports',
    label: 'Help & Supports',
    path: '/help-supports',
    icon: LifeBuoy,
    permission: 'operations.view',
  },
  {
    key: 'users',
    label: 'Users',
    icon: Users,
    permission: 'drivers.view',
    children: [
      { key: 'drivers', label: 'Driver Management', path: '/drivers' },
      { key: 'passengers', label: 'Passenger Management', path: '/passengers' },
      { key: 'driver-rewards', label: 'Driver Rewards Management', path: '/driver-rewards' },
      { key: 'tier-management', label: 'Tier Management', path: '/drivers/tiers' },
    ],
  },
  {
    key: 'compliance',
    label: 'Compliance',
    path: '/compliance',
    icon: Shield,
    permission: 'compliance.view',
  },
  // {
  //   key: 'vehicle-eligibility',
  //   label: 'Vehicle Eligibility Engine',
  //   path: '/vehicle-eligibility',
  //   icon: FileCheck,
  //   permission: 'eligibility.view',
  // },
  {
    key: 'ride-categories',
    label: 'Ride Categories',
    path: '/ride-categories',
    icon: Car,
    permission: 'eligibility.view',
  },
  {
    key: 'demand-intelligence',
    label: 'Demand Intelligence',
    path: '/demand-intelligence',
    icon: TrendingUp,
    permission: 'analytics.view',
  },
  {
    key: 'pricing',
    label: 'Dynamic Pricing',
    path: '/pricing',
    icon: Gauge,
    permission: 'pricing.view',
  },
  // {
  //   key: 'driver-bonuses',
  //   label: 'Driver Bonuses',
  //   path: '/driver-bonuses',
  //   icon: Gift,
  //   permission: 'pricing.view',
  // },
  {
    key: 'reservations',
    label: 'Reservations',
    path: '/reservations',
    icon: MapPin,
    permission: 'reservations.view',
  },
  {
    key: 'locations',
    label: 'Location Management',
    path: '/locations',
    icon: Globe2,
    permission: 'settings.view',
  },
  {
    key: 'finance',
    label: 'Financial Center',
    path: '/finance',
    icon: Wallet,
    permission: 'finance.view',
  },
  {
    key: 'analytics',
    label: 'Analytics Center',
    path: '/analytics',
    icon: BarChart3,
    permission: 'analytics.view',
  },
  {
    key: 'settings',
    label: 'System Settings',
    icon: Settings,
    permission: 'settings.view',
    children: [
      { key: 'profile-settings', label: 'Profile', path: '/settings/profile' },
      { key: 'system-configuration', label: 'System Configuration', path: '/settings/system-configuration' },
      { key: 'fare-configuration', label: 'Fare Configuration', path: '/settings/fare-configurations' },
      { key: 'safety-settings', label: 'Safety Configuration', path: '/settings/safety' },
      { key: 'notifications', label: 'Notifications', path: '/settings/notifications' },
      { key: 'legal', label: 'Legal & Policies', path: '/settings/legal' },
      { key: 'integrations', label: 'Integrations', path: '/settings/integrations' },
      {
        key: 'reservation-config',
        label: 'Reservation Configuration',
        path: '/settings/reservations',
        permission: 'reservations.create_manual',
      },
      { key: 'admin-roles', label: 'Admin Roles', path: '/settings/admin-roles' },
    ],
  },
]

export const QUICK_LINKS = [
  { label: 'Airport Queue', path: '/locations?tab=airports', icon: Plane },
  { label: 'Surge Monitor', path: '/pricing', icon: AlertTriangle },
  { label: 'Live Trips', path: '/operations/live-trips', icon: Map },
  { label: 'Stripe Payouts', path: '/finance?tab=payouts', icon: CreditCard },
  { label: 'Compliance Alerts', path: '/compliance', icon: Building2 },
]
