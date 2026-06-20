import { useMemo, useState } from 'react'
import { Tag } from 'antd'
import { Car, MapPin, Plane, Zap } from 'lucide-react'
import { GOOGLE_MAPS_API_KEY } from '@/constants'
import {
  MAP_LAYER_OPTIONS,
  type MapLayer,
} from '@/features/demand-intelligence/demandIntelligenceData'
import {
  useGetDashboardKpisQuery,
  useGetDemandZonesQuery,
  useGetReservationsQuery,
  useGetSurgeZonesQuery,
} from '@/services/api'

const LAYER_ICONS: Record<MapLayer, typeof Car> = {
  Drivers: Car,
  Reservations: MapPin,
  Airports: Plane,
  'Surge Zones': Zap,
}

export function LiveOperationsMap() {
  const [layers, setLayers] = useState<MapLayer[]>(['Drivers', 'Surge Zones'])

  const { data: zones = [] } = useGetDemandZonesQuery()
  const { data: reservations = [] } = useGetReservationsQuery()
  const { data: surgeZones = [] } = useGetSurgeZonesQuery()
  const { data: kpis = [] } = useGetDashboardKpisQuery()

  const stats = useMemo(() => {
    const availableDrivers = zones.reduce((sum, z) => sum + z.availableDrivers, 0)
    const openReservations = reservations.filter((r) =>
      ['pending', 'assigned'].includes(r.status),
    ).length
    const airportReservations = reservations.filter((r) => r.type === 'airport').length
    const airportQueue = kpis.find((k) => k.key === 'airportQueue')?.value ?? 0
    const activeSurgeZones = surgeZones.filter((z) => z.active)

    return {
      availableDrivers,
      openReservations,
      airportReservations,
      airportQueue,
      activeSurgeZones: activeSurgeZones.length,
      surgeZoneNames: activeSurgeZones.map((z) => z.name).join(', '),
    }
  }, [zones, reservations, surgeZones, kpis])

  const toggleLayer = (layer: MapLayer) => {
    setLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer],
    )
  }

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">Live Operations Map</h3>
          <p className="text-xs text-alygo-text-muted">
            Monitor drivers, reservations, airports, and surge zones from one view.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {MAP_LAYER_OPTIONS.map((layer) => {
            const Icon = LAYER_ICONS[layer]
            const active = layers.includes(layer)
            return (
              <Tag
                key={layer}
                className={`cursor-pointer select-none ${active ? '!border-indigo-500 !bg-indigo-500/20 !text-indigo-300' : ''}`}
                onClick={() => toggleLayer(layer)}
              >
                <Icon className="mr-1 inline h-3 w-3" />
                {layer}
              </Tag>
            )
          })}
        </div>
      </div>

      <div className="relative min-h-[420px] overflow-hidden rounded-xl border border-white/5 bg-[#0a0c10]">
        {GOOGLE_MAPS_API_KEY ? (
          <div className="flex h-[420px] items-center justify-center text-alygo-text-muted">
            Google Maps operational layer — configure VITE_GOOGLE_MAPS_API_KEY
          </div>
        ) : (
          <div className="relative h-[420px] p-6">
            <div className="absolute inset-0 opacity-20">
              <div className="grid h-full grid-cols-8 grid-rows-5 gap-1 p-4">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded border border-white/5"
                    style={{
                      backgroundColor: `rgba(99, 102, 241, ${0.03 + (i % 4) * 0.04})`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-alygo-text-muted">
                  Active layers: {layers.join(', ') || 'None'}
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Live
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {layers.includes('Drivers') && (
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                    <Car className="mb-1 h-4 w-4 text-blue-400" />
                    <p className="text-lg font-semibold text-white">
                      {stats.availableDrivers.toLocaleString()}
                    </p>
                    <p className="text-xs text-alygo-text-muted">Available drivers</p>
                  </div>
                )}
                {layers.includes('Reservations') && (
                  <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3">
                    <MapPin className="mb-1 h-4 w-4 text-cyan-400" />
                    <p className="text-lg font-semibold text-white">
                      {stats.openReservations.toLocaleString()}
                    </p>
                    <p className="text-xs text-alygo-text-muted">Open reservations</p>
                  </div>
                )}
                {layers.includes('Airports') && (
                  <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-3">
                    <Plane className="mb-1 h-4 w-4 text-purple-400" />
                    <p className="text-lg font-semibold text-white">
                      {stats.airportQueue.toLocaleString()}
                    </p>
                    <p className="text-xs text-alygo-text-muted">
                      Airport queue · {stats.airportReservations} reservations
                    </p>
                  </div>
                )}
                {layers.includes('Surge Zones') && (
                  <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3">
                    <Zap className="mb-1 h-4 w-4 text-orange-400" />
                    <p className="text-lg font-semibold text-white">
                      {stats.activeSurgeZones.toLocaleString()}
                    </p>
                    <p className="text-xs text-alygo-text-muted">Active surge zones</p>
                  </div>
                )}
              </div>

              {layers.includes('Surge Zones') && stats.surgeZoneNames && (
                <div className="flex flex-wrap gap-2">
                  {stats.surgeZoneNames.split(', ').map((name) => (
                    <Tag key={name} color="orange">
                      {name}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
