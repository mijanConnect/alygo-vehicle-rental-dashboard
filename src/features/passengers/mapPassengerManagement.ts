import type { Passenger } from '@/types'
import type {
  LivePassengerItem,
  PassengerDetailsData,
  PassengerListItem,
} from '@/redux/api/passengersApi'

function normalizePassengerStatus(
  status?: string,
): Passenger['status'] {
  const value = (status ?? '').toLowerCase()
  if (value === 'active') return 'active'
  if (value === 'suspended') return 'suspended'
  if (value === 'banned') return 'banned'
  return 'active'
}

export function mapPassengerListItem(item: PassengerListItem): Passenger {
  return {
    id: item.passengerId,
    name: item.fullName?.trim() || '—',
    email: item.email?.trim() || '—',
    phone: item.phone?.trim() || '—',
    rating: item.averageRating ?? 0,
    completedTrips: item.totalTrips ?? 0,
    walletBalance: item.walletBalance ?? 0,
    status: normalizePassengerStatus(item.accountStatus),
    city: item.city?.trim() || '—',
    joinedAt: '',
  }
}

export function mapLivePassengerItem(item: LivePassengerItem): Passenger {
  const id = item.passengerId || item._id || ''
  return {
    id,
    name: item.fullName?.trim() || item.name?.trim() || `Passenger ${id.slice(-6) || '—'}`,
    email: item.email?.trim() || '—',
    phone: item.phone?.trim() || '—',
    rating: item.averageRating ?? 0,
    completedTrips: item.totalTrips ?? 0,
    walletBalance: item.walletBalance ?? 0,
    status: normalizePassengerStatus(item.accountStatus || item.status),
    city: item.city?.trim() || item.location?.address?.trim() || '—',
    joinedAt: '',
  }
}

export function mapPassengerDetails(data: PassengerDetailsData): Passenger {
  return {
    id: data.basicInformation.passengerId,
    name: data.basicInformation.fullName?.trim() || '—',
    email: data.basicInformation.email?.trim() || '—',
    phone: data.basicInformation.phone?.trim() || '—',
    rating: data.rideStatistics.averageRating ?? 0,
    completedTrips: data.rideStatistics.completedTrips ?? data.rideStatistics.totalTrips ?? 0,
    walletBalance: data.wallet.currentBalance ?? 0,
    status: normalizePassengerStatus(data.account.accountStatus),
    city: '—',
    joinedAt: data.account.createdAt ?? '',
  }
}
