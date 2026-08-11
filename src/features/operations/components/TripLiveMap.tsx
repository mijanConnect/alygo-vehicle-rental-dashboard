import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api'
import { Progress, Spin, Tag } from 'antd'
import { Car, MapPin, Navigation, Timer } from 'lucide-react'
import { useMemo } from 'react'
import { GOOGLE_MAPS_API_KEY } from '@/constants'
import { getGoogleMapsLoaderOptions } from '@/constants/googleMaps'
import type { TripLiveMapData } from '@/types/tripOperations'

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '320px',
  borderRadius: '12px',
}

interface TripLiveMapProps {
  data: TripLiveMapData
}

function toLatLng(point?: { lat: number; lng: number } | null) {
  if (!point || typeof point.lat !== 'number' || typeof point.lng !== 'number') {
    return null
  }
  return { lat: point.lat, lng: point.lng }
}

export function TripLiveMap({ data }: TripLiveMapProps) {
  const { isLoaded, loadError } = useJsApiLoader(getGoogleMapsLoaderOptions())

  const pickup = toLatLng(data.pickup)
  const dropoff = toLatLng(data.dropoff)
  const driver = toLatLng(data.driver)
  const stops = (data.stops ?? [])
    .map((stop) => toLatLng(stop))
    .filter((point): point is { lat: number; lng: number } => Boolean(point))

  const path = useMemo(() => {
    if (!isLoaded || !data.polyline || !window.google?.maps?.geometry?.encoding) {
      return [] as google.maps.LatLngLiteral[]
    }
    try {
      return google.maps.geometry.encoding
        .decodePath(data.polyline)
        .map((point) => ({ lat: point.lat(), lng: point.lng() }))
    } catch {
      return []
    }
  }, [data.polyline, isLoaded])

  const center = driver ?? pickup ?? dropoff ?? { lat: 23.8103, lng: 90.4125 }

  const fitBounds = (map: google.maps.Map | null) => {
    if (!map || !window.google) return
    const points = [
      ...path,
      ...(pickup ? [pickup] : []),
      ...(dropoff ? [dropoff] : []),
      ...(driver ? [driver] : []),
      ...stops,
    ]
    if (points.length < 2) {
      map.setCenter(center)
      map.setZoom(13)
      return
    }
    const bounds = new google.maps.LatLngBounds()
    points.forEach((point) => bounds.extend(point))
    map.fitBounds(bounds, 48)
  }

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
          {!GOOGLE_MAPS_API_KEY ? (
            <div className="flex h-full min-h-[320px] items-center justify-center p-4 text-center text-sm text-alygo-text-muted">
              Google Maps API key missing. Set `VITE_API_GOOGLE_MAPS_URL` or
              `VITE_GOOGLE_MAPS_API_KEY` in `.env.local`, then restart the dev server.
            </div>
          ) : loadError ? (
            <div className="flex h-full min-h-[320px] items-center justify-center p-4 text-center text-sm text-red-400">
              Failed to load Google Maps. Check the API key and Maps JavaScript API access.
            </div>
          ) : !isLoaded ? (
            <div className="flex h-full min-h-[320px] items-center justify-center">
              <Spin />
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={center}
              zoom={13}
              onLoad={fitBounds}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              {path.length > 1 ? (
                <Polyline
                  path={path}
                  options={{
                    strokeColor: '#6366f1',
                    strokeOpacity: 0.9,
                    strokeWeight: 4,
                  }}
                />
              ) : null}

              {pickup ? (
                <Marker
                  position={pickup}
                  label={{ text: 'P', color: 'white', fontWeight: '700' }}
                  title={data.pickupLabel}
                />
              ) : null}

              {stops.map((stop, index) => (
                <Marker
                  key={`stop-${index}`}
                  position={stop}
                  label={{ text: String(index + 1), color: 'white', fontWeight: '700' }}
                  title={`Stop ${index + 1}`}
                />
              ))}

              {dropoff ? (
                <Marker
                  position={dropoff}
                  label={{ text: 'D', color: 'white', fontWeight: '700' }}
                  title={data.dropoffLabel}
                />
              ) : null}

              {driver ? (
                <Marker
                  position={driver}
                  label={{ text: 'DR', color: 'white', fontWeight: '700' }}
                  title="Driver"
                />
              ) : null}
            </GoogleMap>
          )}
        </div>

        <div className="space-y-3">
          <MapStat icon={Car} label="Driver Current Location" value={data.driverLocation} />
          <MapStat icon={MapPin} label="Passenger Pickup" value={data.pickupLabel} />
          <MapStat icon={Navigation} label="Destination" value={data.dropoffLabel} />
          <MapStat
            icon={Timer}
            label="ETA"
            value={data.etaMinutes > 0 ? `${data.etaMinutes} min` : '—'}
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
