import type {
  RideCategoryItem,
  RideCategoryStatus,
  RideCategoryVehicleRequirements,
  RideCategoryWritePayload,
  VehicleType,
} from '@/redux/api/rideCategoriesApi'
import { VEHICLE_TYPE } from '@/redux/api/rideCategoriesApi'

export interface RideCategoryRow {
  id: string
  name: string
  description: string
  commissionRate: number
  minimumDriverRating: number
  vehicleRequirements: RideCategoryVehicleRequirements
  status: RideCategoryStatus
  supportsReservation: boolean
  reservationFee: number
  serviceCategoryId?: string
  serviceCategoryName?: string
  createdAt: string
  updatedAt?: string
}

export interface RideCategoryFormValues {
  name: string
  description: string
  commissionRate: number
  minimumDriverRating: number
  vehicleRequirements: RideCategoryVehicleRequirements
  serviceCategoryId?: string
}

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  [VEHICLE_TYPE.CAR]: 'Car',
  [VEHICLE_TYPE.BIKE]: 'Bike',
  [VEHICLE_TYPE.CNG]: 'CNG',
  [VEHICLE_TYPE.AMBULANCE]: 'Ambulance',
  [VEHICLE_TYPE.TRUCK]: 'Truck',
}

export const VEHICLE_TYPE_OPTIONS = [
  { label: VEHICLE_TYPE_LABELS.car, value: VEHICLE_TYPE.CAR },
  { label: VEHICLE_TYPE_LABELS.bike, value: VEHICLE_TYPE.BIKE },
  { label: VEHICLE_TYPE_LABELS.cng, value: VEHICLE_TYPE.CNG },
  { label: VEHICLE_TYPE_LABELS.ambulance, value: VEHICLE_TYPE.AMBULANCE },
  { label: VEHICLE_TYPE_LABELS.truck, value: VEHICLE_TYPE.TRUCK },
]

function isVehicleType(value: string): value is VehicleType {
  return Object.values(VEHICLE_TYPE).includes(value as VehicleType)
}

function normalizeVehicleTypes(types: string[] | undefined): VehicleType[] {
  return (types ?? []).filter(isVehicleType)
}

export function defaultRideCategoryFormValues(): RideCategoryFormValues {
  return {
    name: '',
    description: '',
    commissionRate: 20,
    minimumDriverRating: 0,
    vehicleRequirements: {
      vehicleTypes: [VEHICLE_TYPE.CAR],
      minimumSeats: 1,
      luggageCapacity: 0,
    },
  }
}

function resolveServiceCategoryId(item: RideCategoryItem): string | undefined {
  if (!item.serviceCategoryId) return undefined
  return typeof item.serviceCategoryId === 'string'
    ? item.serviceCategoryId
    : item.serviceCategoryId._id
}

function resolveServiceCategoryName(item: RideCategoryItem): string | undefined {
  if (!item.serviceCategoryId || typeof item.serviceCategoryId === 'string') return undefined
  return item.serviceCategoryId.name
}

export function mapRideCategoryItem(item: RideCategoryItem): RideCategoryRow {
  return {
    id: item._id,
    name: item.name,
    description: item.description,
    commissionRate: item.commissionRate,
    minimumDriverRating: item.minimumDriverRating,
    vehicleRequirements: {
      vehicleTypes: normalizeVehicleTypes(item.vehicleRequirements?.vehicleTypes),
      minimumSeats: item.vehicleRequirements?.minimumSeats ?? 1,
      luggageCapacity: item.vehicleRequirements?.luggageCapacity ?? 0,
    },
    status: item.status === 'inactive' ? 'inactive' : 'active',
    supportsReservation: item.supportsReservation ?? false,
    reservationFee: item.reservationFee ?? 0,
    serviceCategoryId: resolveServiceCategoryId(item),
    serviceCategoryName: resolveServiceCategoryName(item),
    createdAt: item.createdAt ?? '',
    updatedAt: item.updatedAt,
  }
}

export function rideCategoryToFormValues(row: RideCategoryRow): RideCategoryFormValues {
  return {
    name: row.name,
    description: row.description,
    commissionRate: row.commissionRate,
    minimumDriverRating: row.minimumDriverRating,
    vehicleRequirements: {
      vehicleTypes: [...row.vehicleRequirements.vehicleTypes],
      minimumSeats: row.vehicleRequirements.minimumSeats,
      luggageCapacity: row.vehicleRequirements.luggageCapacity ?? 0,
    },
    serviceCategoryId: row.serviceCategoryId,
  }
}

export function buildRideCategoryWritePayload(
  values: RideCategoryFormValues,
): RideCategoryWritePayload {
  const payload: RideCategoryWritePayload = {
    name: values.name.trim(),
    description: values.description.trim(),
    commissionRate: values.commissionRate,
    minimumDriverRating: values.minimumDriverRating,
    vehicleRequirements: {
      vehicleTypes: values.vehicleRequirements.vehicleTypes,
      minimumSeats: values.vehicleRequirements.minimumSeats,
      ...(values.vehicleRequirements.luggageCapacity !== undefined
        ? { luggageCapacity: values.vehicleRequirements.luggageCapacity }
        : {}),
    },
  }

  if (values.serviceCategoryId?.trim()) {
    payload.serviceCategoryId = values.serviceCategoryId.trim()
  }

  return payload
}

export function formatVehicleRequirements(requirements: RideCategoryVehicleRequirements): string {
  const types =
    requirements.vehicleTypes.map((type) => VEHICLE_TYPE_LABELS[type] ?? type).join(', ') || '—'
  return `${types} · ${requirements.minimumSeats} seats`
}
