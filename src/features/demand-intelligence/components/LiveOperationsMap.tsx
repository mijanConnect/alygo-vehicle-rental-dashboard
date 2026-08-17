import { useMemo, useState } from 'react'
import { Tag, Spin } from 'antd'
import { Car, MapPin, Plane, Zap } from 'lucide-react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { GOOGLE_MAPS_API_KEY } from '@/constants'
import { getGoogleMapsLoaderOptions } from '@/constants/googleMaps'
import {
  MAP_LAYER_OPTIONS,
  type MapLayer,
} from '@/features/demand-intelligence/demandIntelligenceData'
import { useGetLiveMapDataQuery } from '@/redux/api/demandIntelligenceApi'

const LAYER_ICONS: Record<MapLayer, typeof Car> = {
  Drivers: Car,
  Reservations: MapPin,
  Airports: Plane,
  'Surge Zones': Zap,
}

const mapCenter = { lat: 23.8103, lng: 90.4125 } // Dhaka center

export function LiveOperationsMap() {
  const [layers, setLayers] = useState<MapLayer[]>(['Drivers', 'Surge Zones'])

  const { data: liveMapData } = useGetLiveMapDataQuery()
  const { isLoaded, loadError } = useJsApiLoader(getGoogleMapsLoaderOptions())

  const stats = useMemo(() => {
    return {
      availableDrivers: liveMapData?.availableDriverCount ?? 0,
      openReservations: liveMapData?.reservationCount ?? 0,
      airportReservations: liveMapData?.reservationCount ?? 0,
      airportQueue: liveMapData?.airportCount ?? 0,
      activeSurgeZones: liveMapData?.surgeZoneCount ?? 0,
      surgeZoneNames: '',
    }
  }, [liveMapData])

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
        {!GOOGLE_MAPS_API_KEY ? (
          // Mode A: Mock Grid Background (no API key configured)
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
                  Live (Mock Map Layer)
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
                      Airport queue
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
            </div>
          </div>
        ) : loadError ? (
          <div className="flex h-[420px] items-center justify-center text-red-400 text-center p-4">
            Failed to load Google Maps. Please check your API key configuration.
          </div>
        ) : !isLoaded ? (
          <div className="flex h-[420px] items-center justify-center">
            <Spin />
          </div>
        ) : (
          // Mode B: Google Map Layer (when API key is configured)
          <div className="relative h-[420px]">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '420px', borderRadius: '12px' }}
              center={mapCenter}
              zoom={11}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              {layers.includes('Drivers') &&
                (liveMapData?.drivers ?? []).map((d) => (
                  <Marker
                    key={d.driverId}
                    position={{ lat: d.latitude, lng: d.longitude }}
                    title={d.driverName}
                  />
                ))}
            </GoogleMap>

            {/* Floating Overlays */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-start justify-between pointer-events-none">
              <div className="rounded-lg border border-white/10 bg-black/85 px-3 py-2 text-xs text-alygo-text-muted pointer-events-auto">
                Active layers: {layers.join(', ') || 'None'}
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/85 px-3 py-1.5 text-xs text-emerald-400 pointer-events-auto">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Live Map
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-10 grid grid-cols-2 gap-3 md:grid-cols-4 pointer-events-auto">
              {layers.includes('Drivers') && (
                <div className="rounded-lg border border-blue-500/20 bg-black/85 p-3">
                  <Car className="mb-1 h-4 w-4 text-blue-400" />
                  <p className="text-lg font-semibold text-white">
                    {stats.availableDrivers.toLocaleString()}
                  </p>
                  <p className="text-xs text-alygo-text-muted">Available drivers</p>
                </div>
              )}
              {layers.includes('Reservations') && (
                <div className="rounded-lg border border-cyan-500/20 bg-black/85 p-3">
                  <MapPin className="mb-1 h-4 w-4 text-cyan-400" />
                  <p className="text-lg font-semibold text-white">
                    {stats.openReservations.toLocaleString()}
                  </p>
                  <p className="text-xs text-alygo-text-muted">Open reservations</p>
                </div>
              )}
              {layers.includes('Airports') && (
                <div className="rounded-lg border border-purple-500/20 bg-black/85 p-3">
                  <Plane className="mb-1 h-4 w-4 text-purple-400" />
                  <p className="text-lg font-semibold text-white">
                    {stats.airportQueue.toLocaleString()}
                  </p>
                  <p className="text-xs text-alygo-text-muted">
                    Airport queue
                  </p>
                </div>
              )}
              {layers.includes('Surge Zones') && (
                <div className="rounded-lg border border-orange-500/20 bg-black/85 p-3">
                  <Zap className="mb-1 h-4 w-4 text-orange-400" />
                  <p className="text-lg font-semibold text-white">
                    {stats.activeSurgeZones.toLocaleString()}
                  </p>
                  <p className="text-xs text-alygo-text-muted">Active surge zones</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
