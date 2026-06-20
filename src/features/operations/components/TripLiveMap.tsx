import { Progress, Tag } from 'antd'
import { Car, MapPin, Navigation, Timer } from 'lucide-react'
import { GOOGLE_MAPS_API_KEY } from '@/constants'
import type { TripLiveMapData } from '@/types/tripOperations'

interface TripLiveMapProps {
  data: TripLiveMapData
}

export function TripLiveMap({ data }: TripLiveMapProps) {
  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">Live Map</h3>
          <p className="text-xs text-alygo-text-muted">
            Driver location, route, pickup, destination, and ETA for this trip.
          </p>
        </div>
        <Tag color={data.isLive ? 'processing' : 'default'}>
          {data.isLive ? 'Live Tracking' : 'Tracking Inactive'}
        </Tag>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="relative min-h-[320px] overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] xl:col-span-2">
          {GOOGLE_MAPS_API_KEY ? (
            <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-alygo-text-muted">
              Google Maps integration ready — set VITE_GOOGLE_MAPS_API_KEY
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.15),transparent_45%),radial-gradient(circle_at_75%_60%,rgba(16,185,129,0.12),transparent_40%)]" />
              <svg viewBox="0 0 800 320" className="absolute inset-0 h-full w-full opacity-80">
                <path
                  d="M80 240 C 180 180, 260 120, 360 150 S 560 80, 720 100"
                  fill="none"
                  stroke="rgba(99,102,241,0.8)"
                  strokeWidth="4"
                  strokeDasharray="8 6"
                />
              </svg>
              <div className="absolute left-[8%] top-[68%] rounded-full bg-emerald-500/20 p-2">
                <MapPin className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="absolute left-[42%] top-[42%] rounded-full bg-indigo-500/20 p-2">
                <Car className="h-5 w-5 text-indigo-300" />
              </div>
              <div className="absolute left-[78%] top-[28%] rounded-full bg-rose-500/20 p-2">
                <Navigation className="h-5 w-5 text-rose-400" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b1020] via-[#0b1020]/90 to-transparent p-4">
                <p className="text-sm font-medium text-white">{data.routeSummary}</p>
                <p className="text-xs text-alygo-text-muted">Active route preview</p>
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          <MapStat
            icon={Car}
            label="Driver Current Location"
            value={data.driverLocation}
          />
          <MapStat icon={MapPin} label="Passenger Pickup" value={data.pickupLabel} />
          <MapStat icon={Navigation} label="Destination" value={data.dropoffLabel} />
          <MapStat
            icon={Timer}
            label="ETA"
            value={data.isLive ? `${data.etaMinutes} min` : '—'}
          />
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-alygo-text-muted">Route Progress</span>
              <span className="font-medium text-white">{data.routeProgressPercent}%</span>
            </div>
            <Progress
              percent={data.routeProgressPercent}
              showInfo={false}
              strokeColor={data.isLive ? '#6366f1' : '#64748b'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function MapStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Car
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="mb-1 flex items-center gap-2 text-xs text-alygo-text-muted">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-sm text-white">{value}</p>
    </div>
  )
}
